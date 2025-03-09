import { useParams } from "react-router-dom";
import { UserProfile } from "../components/user-profile";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-6">
      <UserProfile username={username} />
    </main>
  );
}
