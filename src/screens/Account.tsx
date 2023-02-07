import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Avatar from "./Avatar";

type Props = {
  session: any;
};

const Account = ({ session }: Props) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | any>(null);
  const [full_name, setFullname] = useState<string | any>(null);
  const [website, setWebsite] = useState<string | any>(null);
  const [avatar_url, setAvatarUrl] = useState<string | any>(null);

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url, full_name`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setFullname(data.full_name);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reRenderUIStates();
  };

  const reRenderUIStates = async () => {
    try {
      setLoading(true);
      const { user } = session;

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        full_name,
        updated_at: new Date()
      };

      let { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div aria-live="polite">
      {loading ? (
        "Saving ..."
      ) : (
        <form onSubmit={updateProfile} className="form-widget">
          <Avatar
            url={avatar_url}
            size={150}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              reRenderUIStates();
            }}
          />
          <div>Email: {session.user.email}</div>
          <div>
            <label htmlFor="username">Name</label>
            <input
              id="username"
              type="text"
              value={username || ""}
              onChange={(e) => {
                setUsername(e.currentTarget.value);
                setFullname(e.currentTarget.value);
              }}
            />
          </div>
          <div>
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="url"
              value={website || ""}
              onChange={(e) => setWebsite(e.currentTarget.value)}
            />
          </div>
          <div>
            <button className="button primary block" disabled={loading}>
              Update profile
            </button>
          </div>
        </form>
      )}
      <button
        type="button"
        className="button block"
        onClick={() => supabase.auth.signOut()}
      >
        Sign Out
      </button>
    </div>
  );
};

export default Account;
