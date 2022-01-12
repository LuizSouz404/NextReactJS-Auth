import { useContext } from "react"
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan";
import { withSSTAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <Can permissions={['metrics.list']}>
        <h3>Métricas</h3>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSTAuth(async (ctx) => {
  return {
    props: {}
  }
})
