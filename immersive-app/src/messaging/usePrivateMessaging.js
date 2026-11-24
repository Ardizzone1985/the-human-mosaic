import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "../auth/AuthProvider.jsx";
import { getInbox } from "./privateMessagingService.js";

/*
 * THE HUMAN MOSAIC
 * Private Messaging Hook
 */

const INBOX_REFRESH_INTERVAL = 30000;

function createInitialState(ownerId = null) {
  return {
    ownerId,
    inbox: [],
    loading: false,
    error: "",
  };
}

export default function usePrivateMessaging() {
  const {
    user,
    profile,
    loadingAuth,
    passwordRecovery,
  } = useAuth();

  const userId = user?.id ?? null;

  const enabled =
    !loadingAuth &&
    !!userId &&
    profile?.id === userId &&
    !passwordRecovery;

  const ownerId = enabled ? userId : null;

  const [state, setState] = useState(
    () => createInitialState()
  );

  const requestVersion = useRef(0);

  /*
   * Load or refresh the personal inbox.
   */

  const refreshInbox = useCallback(
    async ({ silent = false } = {}) => {
      if (!ownerId) return;

      const version = ++requestVersion.current;

      setState((previous) => ({
        ...(previous.ownerId === ownerId
          ? previous
          : createInitialState(ownerId)),
        loading: !silent,
        error: "",
      }));

      try {
        const data = await getInbox();

        if (version !== requestVersion.current) {
          return;
        }

        setState({
          ownerId,
          inbox: Array.isArray(data) ? data : [],
          loading: false,
          error: "",
        });
      } catch {
        if (version !== requestVersion.current) {
          return;
        }

        setState((previous) => ({
          ...(previous.ownerId === ownerId
            ? previous
            : createInitialState(ownerId)),
          loading: false,
          error: "Unable to load private messages.",
        }));
      }
    },
    [ownerId]
  );

  /*
   * Reset private data when the session changes.
   * Refresh the inbox while the page is visible.
   */

  useEffect(() => {
    requestVersion.current += 1;

    setState(createInitialState(ownerId));

    if (!ownerId) return;

    void refreshInbox();

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshInbox({ silent: true });
      }
    };

    const interval = window.setInterval(
      refreshIfVisible,
      INBOX_REFRESH_INTERVAL
    );

    document.addEventListener(
      "visibilitychange",
      refreshIfVisible
    );

    return () => {
      requestVersion.current += 1;

      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        refreshIfVisible
      );
    };
  }, [ownerId, refreshInbox]);

  /*
   * Never expose inbox data belonging
   * to a different authenticated user.
   */

  const inbox = useMemo(() => {
    if (!ownerId || state.ownerId !== ownerId) {
      return [];
    }

    return state.inbox;
  }, [ownerId, state]);

  /*
   * Accepted conversations.
   */

  const conversations = useMemo(
    () =>
      inbox.filter(
        (item) => item.status === "accepted"
      ),
    [inbox]
  );

  /*
   * Incoming conversation requests.
   */

  const incomingRequests = useMemo(
    () =>
      inbox.filter(
        (item) =>
          item.status === "pending" &&
          item.is_incoming_request
      ),
    [inbox]
  );

  /*
   * Outgoing conversation requests.
   */

  const outgoingRequests = useMemo(
    () =>
      inbox.filter(
        (item) =>
          item.status === "pending" &&
          !item.is_incoming_request
      ),
    [inbox]
  );

  /*
   * Declined conversation requests.
   */

  const declinedRequests = useMemo(
    () =>
      inbox.filter(
        (item) => item.status === "declined"
      ),
    [inbox]
  );

  /*
   * Total unread messages.
   */

  const unreadCount = useMemo(
    () =>
      conversations.reduce(
        (total, item) =>
          total + (Number(item.unread_count) || 0),
        0
      ),
    [conversations]
  );

  const incomingRequestCount =
    incomingRequests.length;

  /*
   * Find an existing conversation
   * using the participant ID.
   */

  const getConversationForParticipant =
    useCallback(
      (participantId) =>
        inbox.find(
          (item) =>
            item.participant_id === participantId
        ) ?? null,
      [inbox]
    );

  return {
    enabled,
    userId: ownerId,

    inbox,
    conversations,
    incomingRequests,
    outgoingRequests,
    declinedRequests,

    unreadCount,
    incomingRequestCount,

    loading:
      !!ownerId &&
      (state.ownerId !== ownerId || state.loading),

    error:
      ownerId && state.ownerId === ownerId
        ? state.error
        : "",

    refreshInbox,
    getConversationForParticipant,
  };
}
