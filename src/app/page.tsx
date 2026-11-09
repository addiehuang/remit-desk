export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-lg px-md py-xl">
      <h1 className="text-heading-lg font-semibold tracking-tight">Remit Desk</h1>
      <p className="text-body">
        An accessible payments interface for UK business banking, built in the
        open as a reference project. It covers two flows: creating a payment,
        and approving payments under maker-checker rules.
      </p>
      <section className="rounded-md border border-outline bg-surface-variant p-lg">
        <h2 className="text-heading-sm font-semibold">Where this has got to</h2>
        <p className="mt-sm text-caption text-on-surface-variant">
          Design tokens are in place, generated from Figma variables and checked
          against them on every push. Components come next, each one specified,
          tested and checked against WCAG before it reaches a page.
        </p>
      </section>
    </main>
  );
}
