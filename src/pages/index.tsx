import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { withSSTGuest } from "../utils/withSSRGuest";

export default function Home() {
  const { isAuthenticated, signIn } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    await signIn({email, password});  
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={event => setEmail(event.target.value)} />
      <input type="password" value={password} onChange={event => setPassword(event.target.value)} />

      <button type="submit">Entrar</button>
    </form>
  )
}

export const getServerSideProps = withSSTGuest(async (ctx) => {
  return {
    props: {}
  }
})
