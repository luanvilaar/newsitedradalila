import Link from "next/link";

export const metadata = {
  title: "Política de Proteção de Dados | Dra. Dalila Lucena",
  description:
    "Saiba como coletamos, usamos e protegemos seus dados pessoais em conformidade com a LGPD.",
};

export default function DataProtectionPolicyPage() {
  return (
    <main className="bg-white text-text-primary min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent-gold uppercase">
            Política de Proteção de Dados
          </p>
          <h1 className="text-3xl md:text-4xl font-heading text-text-primary">
            Como cuidamos dos seus dados (LGPD)
          </h1>
          <p className="text-text-secondary text-base md:text-lg">
            Esta política explica, de forma transparente, quais dados pessoais tratamos,
            para quais finalidades e quais direitos você pode exercer. Aplicamos os
            princípios da Lei Geral de Proteção de Dados (Lei nº 13.709/2018) em todas
            as nossas operações.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Quem somos e contato</h2>
          <p className="text-text-secondary">
            Controladora dos dados: Dra. Dalila Lucena. Para dúvidas ou solicitações
            relacionadas à privacidade, utilize os canais oficiais de atendimento
            disponibilizados na Área do Paciente ou na nossa página de contato.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Quais dados coletamos</h2>
          <p className="text-text-secondary">Coletamos apenas o necessário para prestar nossos serviços:</p>
          <ul className="list-disc pl-6 space-y-2 text-text-secondary">
            <li>Dados de identificação e contato: nome, e-mail, telefone.</li>
            <li>
              Dados de acesso: credenciais de login e registros técnicos de uso (data, hora,
              IP, dispositivo e navegador) para segurança e prevenção a fraudes.
            </li>
            <li>
              Dados de saúde e históricos clínicos inseridos por você ou pelos profissionais
              autorizados na Área do Paciente, quando estritamente necessários para o
              atendimento médico.
            </li>
            <li>
              Cookies e dados de navegação para garantir funcionalidades básicas e medir
              desempenho do site; você pode ajustar preferências no seu navegador.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Finalidades e bases legais</h2>
          <ul className="list-disc pl-6 space-y-2 text-text-secondary">
            <li>Fornecer acesso à Área do Paciente e aos serviços contratados (execução de contrato).</li>
            <li>Agendar e conduzir consultas, avaliações e acompanhamento clínico (execução de contrato e tutela da saúde).</li>
            <li>Atender solicitações de suporte e comunicação com você (execução de contrato/consentimento).</li>
            <li>Garantir segurança, prevenção a fraudes e cumprimento de obrigações legais (obrigação legal e legítimo interesse).</li>
            <li>
              Enviar comunicações informativas ou de marketing quando houver sua permissão, com opção de cancelamento a qualquer momento (consentimento).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Compartilhamento</h2>
          <p className="text-text-secondary">
            Compartilhamos dados apenas com fornecedores essenciais para a operação do
            site e da Área do Paciente (por exemplo, infraestrutura de armazenamento,
            envio de e-mails transacionais e ferramentas de segurança), sempre sob
            contrato e seguindo boas práticas de proteção de dados. Não vendemos ou
            alugamos seus dados pessoais.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Retenção e eliminação</h2>
          <p className="text-text-secondary">
            Mantemos os dados pelo tempo necessário para cumprir as finalidades acima e
            obrigações legais, inclusive prazos regulatórios aplicáveis à área da saúde.
            Após esse período, adotamos procedimentos de anonimização ou eliminação
            segura, salvo quando houver base legal para retenção adicional.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Segurança</h2>
          <p className="text-text-secondary">
            Aplicamos controles técnicos e administrativos para proteger seus dados,
            incluindo uso de conexões criptografadas (HTTPS), controle de acesso por
            perfil e registro de atividades para auditoria. Ainda assim, nenhum ambiente
            é totalmente isento de riscos; caso identifique suspeita de incidente, entre
            em contato imediatamente pelos nossos canais oficiais.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Seus direitos</h2>
          <p className="text-text-secondary">
            Nos termos da LGPD, você pode exercer: confirmação de tratamento, acesso,
            correção de dados incompletos, anonimização ou eliminação de dados
            desnecessários, portabilidade, informação sobre compartilhamentos, revogação
            de consentimento e oposição quando cabível. Para exercer seus direitos, envie
            sua solicitação pelos canais oficiais de atendimento; responderemos dentro dos
            prazos legais.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Cookies e analytics</h2>
          <p className="text-text-secondary">
            Utilizamos cookies essenciais para o funcionamento do site e, quando
            habilitado, cookies de análise para entender desempenho e melhorar a
            experiência. Você pode limitar o uso de cookies nas configurações do seu
            navegador; algumas funções podem ficar indisponíveis se os cookies essenciais
            forem bloqueados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Atualizações desta política</h2>
          <p className="text-text-secondary">
            Podemos atualizar esta política para refletir mudanças legais ou operacionais.
            Sempre indicaremos a data da última atualização e manteremos a versão mais
            recente disponível neste endereço.
          </p>
          <p className="text-xs text-text-muted">Última atualização: março/2026</p>
        </section>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-accent-gold font-medium hover:underline"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
