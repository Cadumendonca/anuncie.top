import { signIn } from "@/auth";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ enviado?: string }> }) {
  const { enviado } = await searchParams;
  if (enviado) return <div className="auth-shell"><h1>Confira seu e-mail</h1><p>Enviamos um link seguro. Ele expira automaticamente e pode ser usado uma vez.</p></div>;
  return <div className="auth-shell"><h1>Acesse sem senha</h1><p>Use o e-mail vinculado ao pagamento para gerenciar seu anúncio.</p><form className="stack-form" action={async (formData) => { "use server"; await signIn("resend", { email: formData.get("email"), redirectTo: "/painel" }); }}><label className="field"><span>E-mail</span><span className="input-shell"><input name="email" type="email" required autoComplete="email" placeholder="voce@empresa.com" /></span></label><button className="primary-button" type="submit">Enviar link de acesso</button></form></div>;
}
