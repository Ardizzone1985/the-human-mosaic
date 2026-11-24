import { supabase } from "../supabaseClient.js";

/*
 * THE HUMAN MOSAIC
 * Private Messaging Service
 *
 * All private messaging operations must use
 * the authorized Supabase RPC functions.
 *
 * No direct access to private messaging tables.
 */

async function callPrivateMessagingRpc(
  functionName,
  parameters = {}
) {
  const { data, error } = await supabase.rpc(
    functionName,
    parameters
  );

  if (error) {
    throw error;
  }

  return data;
}

/*
 * 1. Request a conversation
 */

export async function requestConversation(recipientId) {
  return callPrivateMessagingRpc(
    "private_messaging_request_conversation",
    {
      p_recipient_id: recipientId,
    }
  );
}

/*
 * 2. Accept or decline a conversation request
 */

export async function respondConversation(
  conversationId,
  accept
) {
  return callPrivateMessagingRpc(
    "private_messaging_respond_conversation",
    {
      p_conversation_id: conversationId,
      p_accept: accept,
    }
  );
}

/*
 * 3. Load the personal inbox
 */

export async function getInbox() {
  const data = await callPrivateMessagingRpc(
    "private_messaging_get_inbox"
  );

  return data ?? [];
}

/*
 * 4. Load conversation messages
 */

export async function getMessages(
  conversationId,
  beforeMessageId = null
) {
  const data = await callPrivateMessagingRpc(
    "private_messaging_get_messages",
    {
      p_conversation_id: conversationId,
      p_before_message_id: beforeMessageId,
    }
  );

  return data ?? [];
}

/*
 * 5. Send a private message
 */

export async function sendMessage(
  conversationId,
  body
) {
  return callPrivateMessagingRpc(
    "private_messaging_send_message",
    {
      p_conversation_id: conversationId,
      p_body: body,
    }
  );
}

/*
 * 6. Mark messages as read
 */

export async function markAsRead(
  conversationId,
  lastMessageId
) {
  return callPrivateMessagingRpc(
    "private_messaging_mark_as_read",
    {
      p_conversation_id: conversationId,
      p_last_message_id: lastMessageId,
    }
  );
}

/*
 * 7. Block or unblock a participant
 */

export async function setBlock(
  participantId,
  block
) {
  return callPrivateMessagingRpc(
    "private_messaging_set_block",
    {
      p_participant_id: participantId,
      p_block: block,
    }
  );
}

/*
 * 8. Report a conversation or message
 */

export async function reportConversation(
  conversationId,
  reason,
  details = null,
  messageId = null
) {
  return callPrivateMessagingRpc(
    "private_messaging_report",
    {
      p_conversation_id: conversationId,
      p_reason: reason,
      p_details: details,
      p_message_id: messageId,
    }
  );
}
