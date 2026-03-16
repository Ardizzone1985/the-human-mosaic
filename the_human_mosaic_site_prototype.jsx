export default function TheHumanMosaicPrototype() {
  const rooms = [
    {
      name: "Identity",
      subtitle: "Who we are and where we come from.",
      price: "Up to €15",
      description:
        "Selfies, cultural symbols, monuments, traditional clothing, and images that reflect personal or local identity.",
    },
    {
      name: "Love",
      subtitle: "What we love defines us.",
      price: "Up to €15",
      description:
        "Family, partners, friends, pets, passions, and meaningful moments that represent love in all its forms.",
    },
    {
      name: "Creativity",
      subtitle: "Human imagination without limits.",
      price: "Up to €20",
      description:
        "Art, photography, drawings, concepts, and creative expression. Artistic nudity allowed. Explicit sexual content prohibited.",
    },
  ];

  const steps = [
    "Choose your room",
    "Select your wall and spot",
    "Complete payment",
    "Upload your photo",
    "Wait for approval within 48 hours",
    "Receive your signed digital certificate",
  ];

  const walls = ["Front Wall", "Left Wall", "Right Wall"];

  const stats = [
    { label: "Rooms", value: "3" },
    { label: "Photos", value: "3,000,000" },
    { label: "Museum", value: "Permanent in Italy" },
  ];

  const grid = Array.from({ length: 90 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 rotate-45 grid-cols-2 gap-1 rounded-sm bg-black p-1">
              <div className="rounded-[2px] bg-red-500" />
              <div className="rounded-[2px] bg-yellow-400" />
              <div className="rounded-[2px] bg-green-500" />
              <div className="rounded-[2px] bg-blue-500" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.3em]">The Human Mosaic</div>
              <div className="text-xs text-black/60">The largest collective artwork in the world</div>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#project" className="hover:opacity-60">Project</a>
            <a href="#rooms" className="hover:opacity-60">Rooms</a>
            <a href="#spot" className="hover:opacity-60">Choose Your Spot</a>
            <a href="#guidelines" className="hover:opacity-60">Guidelines</a>
            <a href="#faq" className="hover:opacity-60">FAQ</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-black/10">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <div>
              <div className="mb-5 inline-block rounded-full border border-black px-3 py-1 text-xs uppercase tracking-[0.25em]">
                Permanent Museum in Italy
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
                3 million photos.<br />3 rooms.<br />1 global artwork.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70 md:text-xl">
                Claim your place in <span className="font-medium text-black">The Human Mosaic</span>, a collective art project that will become a permanent museum in Italy once all three rooms are complete.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#spot"
                  className="rounded-2xl bg-black px-6 py-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5"
                >
                  Claim Your Spot
                </a>
                <a
                  href="#project"
                  className="rounded-2xl border border-black px-6 py-4 text-sm font-medium transition hover:bg-black hover:text-white"
                >
                  Explore the Project
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-neutral-50 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-black/50">Live artwork preview</div>
                  <div className="mt-1 text-sm font-medium">Abstract mosaic before full reveal</div>
                </div>
                <div className="rounded-full border border-black/10 px-3 py-1 text-xs">In progress</div>
              </div>
              <div className="grid grid-cols-9 gap-1 rounded-[1.5rem] bg-white p-3">
                {grid.map((cell) => {
                  const filled = cell % 5 === 0 || cell % 7 === 0 || cell % 11 === 0;
                  return (
                    <div
                      key={cell}
                      className={`aspect-square rounded-sm ${filled ? "bg-black" : "bg-neutral-200"}`}
                    />
                  );
                })}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-black/50">{stat.label}</div>
                    <div className="mt-2 text-lg font-semibold">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="project" className="border-b border-black/10">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-[0.3em] text-black/50">The Project</div>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">A collective artwork built one photo at a time.</h2>
              <p className="mt-6 text-lg leading-8 text-black/70">
                The Human Mosaic invites people from around the world to choose a position inside a monumental artwork. Each participant selects a room, claims a wall position, uploads one image, and becomes part of a future physical museum designed specifically for the completed work.
              </p>
            </div>
          </div>
        </section>

        <section id="rooms" className="border-b border-black/10 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-black/50">The Rooms</div>
                <h2 className="mt-4 text-3xl font-semibold md:text-5xl">Three themes. Three million participants.</h2>
              </div>
              <p className="max-w-2xl text-black/70">
                Each room contains 1,000,000 image positions distributed across three walls: Front Wall, Left Wall, and Right Wall.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {rooms.map((room) => (
                <div key={room.name} className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.3em] text-black/50">Room</div>
                  <h3 className="mt-3 text-2xl font-semibold">{room.name}</h3>
                  <p className="mt-3 text-base font-medium text-black/80">{room.subtitle}</p>
                  <p className="mt-5 leading-7 text-black/70">{room.description}</p>
                  <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-5">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-black/50">Price</div>
                      <div className="mt-1 text-lg font-semibold">{room.price}</div>
                    </div>
                    <button className="rounded-2xl border border-black px-4 py-3 text-sm font-medium transition hover:bg-black hover:text-white">
                      Enter Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="spot" className="border-b border-black/10">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-black/50">Choose Your Spot</div>
                <h2 className="mt-4 text-3xl font-semibold md:text-5xl">Select a wall. Claim a position.</h2>
                <p className="mt-6 text-lg leading-8 text-black/70">
                  Every participant receives a room, a wall, a position code, and a photo number. The completed certificate is sent after the uploaded image is approved within 48 hours.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {walls.map((wall) => (
                    <div key={wall} className="rounded-2xl border border-black/10 p-5">
                      <div className="text-xs uppercase tracking-[0.25em] text-black/50">Wall</div>
                      <div className="mt-2 text-lg font-semibold">{wall}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 rounded-[2rem] border border-black/10 bg-neutral-50 p-6">
                  <div className="text-xs uppercase tracking-[0.25em] text-black/50">Example</div>
                  <div className="mt-4 space-y-2 text-sm text-black/80">
                    <p><span className="font-medium text-black">Room:</span> Identity</p>
                    <p><span className="font-medium text-black">Wall:</span> Front Wall</p>
                    <p><span className="font-medium text-black">Photo Number:</span> 000245871</p>
                    <p><span className="font-medium text-black">Position:</span> C-512</p>
                    <p><span className="font-medium text-black">Status:</span> Pending approval</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-black/10 bg-neutral-50 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-black/50">Identity Room</div>
                    <div className="mt-1 text-lg font-semibold">Front Wall</div>
                  </div>
                  <div className="rounded-full border border-black/10 px-3 py-1 text-xs">134,382 / 1,000,000 claimed</div>
                </div>
                <div className="grid grid-cols-10 gap-1 rounded-[1.5rem] bg-white p-4">
                  {Array.from({ length: 120 }, (_, i) => {
                    const taken = i % 4 === 0 || i % 9 === 0;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-sm border ${taken ? "border-black bg-black" : "border-neutral-300 bg-neutral-100 hover:bg-neutral-200"}`}
                        title={taken ? "Taken" : "Available"}
                      />
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-5 text-sm text-black/70">
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-neutral-100 border border-neutral-300" /> Available</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-black" /> Taken</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-black/10 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="text-xs uppercase tracking-[0.3em] text-black/50">How It Works</div>
            <h2 className="mt-4 text-3xl font-semibold md:text-5xl">A clear path from purchase to certificate.</h2>
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.25em] text-black/50">Step {index + 1}</div>
                  <div className="mt-3 text-xl font-semibold">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="guidelines" className="border-b border-black/10">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-black/50">Photo Guidelines</div>
                <h2 className="mt-4 text-3xl font-semibold md:text-5xl">Images are reviewed within 48 hours.</h2>
                <p className="mt-6 text-lg leading-8 text-black/70">
                  To protect the integrity of the artwork, all uploads are manually reviewed before they become part of the mosaic.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-black/10 p-6">
                  <div className="text-sm font-semibold">Allowed</div>
                  <p className="mt-3 leading-7 text-black/70">
                    Identity images, loved ones, pets, art, photography, drawings, conceptual works, and artistic nudity inside the Creativity room.
                  </p>
                </div>
                <div className="rounded-[2rem] border border-black/10 p-6">
                  <div className="text-sm font-semibold">Not Allowed</div>
                  <p className="mt-3 leading-7 text-black/70">
                    Explicit sexual content, violence against people or animals, hateful imagery, illegal material, or copyrighted work without permission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-b border-black/10 bg-neutral-50">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-black/50">FAQ</div>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">What people need to know before joining.</h2>
            </div>
            <div className="mt-12 space-y-4">
              {[
                ["When do I receive my certificate?", "After your image is reviewed and approved, within 48 hours."],
                ["Can I choose my exact spot?", "Yes. You choose your room, wall, and position from the available grid."],
                ["Where will the final museum be located?", "The completed artwork will become a permanent museum in Italy."],
                ["Are refunds available?", "Payments are generally non-refundable except in cases of technical error."],
              ].map(([q, a]) => (
                <div key={q} className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
                  <div className="text-lg font-semibold">{q}</div>
                  <div className="mt-3 leading-7 text-black/70">{a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-[2.5rem] bg-black px-8 py-16 text-white md:px-12">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-[0.3em] text-white/60">Final Call</div>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">Claim your place in the world’s largest collective artwork.</h2>
              <p className="mt-6 text-lg leading-8 text-white/75">
                The Human Mosaic is not just a website. It is the foundation of a permanent museum built from identity, love, and creativity.
              </p>
              <div className="mt-8">
                <a href="#spot" className="inline-flex rounded-2xl bg-white px-6 py-4 text-sm font-medium text-black transition hover:-translate-y-0.5">
                  Start With Your Spot
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
