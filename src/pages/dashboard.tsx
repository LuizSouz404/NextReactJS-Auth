import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan";
import { withSSTAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const useCanSeeMetrics = useCan({
    roles: ['editor', 'administrator']
  })

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      {useCanSeeMetrics && <h3>Métricas</h3>}
    </>
  )
}

export const getServerSideProps = withSSTAuth(async (ctx) => {
  return {
    props: {}
  }
})
