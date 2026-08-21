import Link from "next/link";
import { CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react/dist/ssr";

const states = {
  sucesso: { icon: CheckCircle, title: "Pagamento recebido", body: "Estamos aguardando a confirmação autoritativa do Mercado Pago. O ranking atualiza automaticamente." },
  pendente: { icon: Clock, title: "Pagamento pendente", body: "Pix e outros meios podem levar alguns instantes. Você receberá um e-mail quando a confirmação chegar." },
  falha: { icon: WarningCircle, title: "Pagamento não concluído", body: "Nenhuma posição foi alterada. Você pode tentar novamente com outro meio de pagamento." }
};
export default async function PaymentStatusPage({ params }: { params: Promise<{ status: string }> }) { const { status } = await params; const state = states[status as keyof typeof states] ?? states.pendente; const Icon = state.icon; return <div className="auth-shell"><Icon size={42} color="var(--coral)" weight="duotone" /><h1>{state.title}</h1><p>{state.body}</p><Link className="primary-button" href="/">Voltar ao ranking</Link></div>; }
