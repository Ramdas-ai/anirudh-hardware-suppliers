// Generic placeholder for pages whose real functionality is built in a later
// phase (see architecture doc). Keeps routing/navigation testable from Phase 1.
export default function PageStub({ title, phase }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-navy">{title}</h1>
      <p className="mt-3 font-body text-iron-gray">
        This page is scaffolded and routed. Full functionality arrives in {phase}.
      </p>
    </div>
  )
}
