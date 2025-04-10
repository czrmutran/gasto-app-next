export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-100">
      {/* Header */}
      <section className="text-center mt-12">
        <h1 className="text-5xl font-extrabold text-blue-600 mb-4">
          Calculadora de Gastos
        </h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto">
          Organize seus gastos de forma simples e eficiente. Controle suas despesas diárias, mensais ou por categoria e ganhe clareza sobre sua vida financeira.
        </p>
      </section>

      {/* Ilustração */}
      <section className="mt-8">
        <img
          src="https://source.unsplash.com/400x300/?finance,calculator"
          alt="Ilustração de finanças"
          className="rounded-lg shadow-lg"
        />
      </section>

      {/* Botão de início */}
      <section className="mt-8">
        <a
          href="/calculadora"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-300"
        >
          Começar Agora
        </a>
      </section>

      {/* Rodapé */}
      <footer className="mt-12 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} Calculadora de Gastos. Todos os direitos reservados.
      </footer>
    </main>
  );
}
