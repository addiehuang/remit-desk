export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Remit Desk</h1>
      <p className="text-lg leading-relaxed">
        An accessible payments interface for UK business banking, built in the
        open as a reference project. It covers two flows: creating a payment,
        and approving payments under maker-checker rules.
      </p>
      <p className="text-base leading-relaxed">
        Neither flow is built yet. Components are developed in Storybook first,
        each one specified, tested and checked against WCAG before it reaches a
        page.
      </p>
    </main>
  );
}
