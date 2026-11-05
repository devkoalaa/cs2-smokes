import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PageTitle } from '@/components/hub-ui';

export const metadata: Metadata = { title: 'Privacidade', description: 'O que o CS2 Hub guarda, quem vê e como apagar.', alternates: { canonical: '/privacidade' } };

const sections: [string, React.ReactNode][] = [
  ['O que guardamos', <ul key="a" className="list-disc pl-5 space-y-1">
    <li>Do login pela Steam: seu SteamID, nome e foto de perfil. Nunca vemos sua senha.</li>
    <li>Se você ligar a importação: o código de autenticação de partidas (guardado criptografado) e o código da última partida, para buscar as próximas.</li>
    <li>De cada partida importada: mapa, placar, estatísticas e as posições de cada abate de todos os jogadores, como estão na demo da Valve.</li>
    <li>Seus grupos e os links de partida que você compartilhou.</li></ul>],
  ['Quem vê o quê', <ul key="b" className="list-disc pl-5 space-y-1">
    <li>Seu histórico e o placar completo de uma partida: só quem jogou aquela partida.</li>
    <li>Seu perfil, seus números e o ranking: você e quem está em algum grupo com você. Não existe perfil público.</li>
    <li>A miniatura de um link compartilhado mostra o mapa, o placar e os números de quem compartilhou e de quem é do grupo dessa pessoa e deixou ligado “Aparecer nas miniaturas dos links” no perfil.</li>
    <li>Jogadores que não usam o CS2 Hub aparecem só no placar das partidas, para quem jogou com eles.</li></ul>],
  ['Demos', <p key="c">As demos são baixadas dos servidores da Valve, analisadas e apagadas em seguida. Só os números ficam guardados.</p>],
  ['Como apagar', <p key="d">No seu <Link href="/perfil" className="text-primary hover:underline">perfil</Link>, “Excluir meus dados” desliga a importação, apaga os grupos que você criou, tira você dos outros, apaga seus links e libera sua vaga. As partidas que só você importou e em que nenhum outro usuário jogou também são apagadas. Seus números continuam no placar das partidas de quem jogou com você, como no placar do próprio jogo. Para pedir qualquer outra coisa sobre os seus dados, fale com o administrador pelo <a href="https://github.com/devkoalaa" target="_blank" rel="noreferrer" className="text-primary hover:underline">GitHub</a>.</p>],
  ['Valve', <p key="e">O CS2 Hub é um projeto da comunidade e não tem ligação com a Valve. Counter-Strike e Steam são marcas da Valve Corporation.</p>],
];

export default function PrivacyPage() {
  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto max-w-3xl px-4 py-8 md:py-12 space-y-8">
      <PageTitle>Privacidade</PageTitle>
      {sections.map(([title, body]) => <section key={title} className="space-y-2 text-muted-foreground leading-relaxed">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>{body}</section>)}
    </main>
    <Footer />
  </div>;
}
