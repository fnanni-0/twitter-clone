import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FollowFlex } from "../styles/profile";
import theme from "../../redux/reducers/theme";

const URL = process.env.REACT_APP_SERVER_URL;

const Follower = (props) => {
  const [response, setResponse] = useState(null);

  const { user } = props;

  const { username } = useParams();
  const theme = useSelector((state) => state.theme);

  if (user === undefined) return <React.Fragment></React.Fragment>;

  useEffect(() => {
    // ComponentDidMount
    (async () => {
      setResponse({
        followers: user.followers,
        following: user.following,
      });
    })();
  }, [user]);

  if (!response) return <React.Fragment></React.Fragment>;

  return (
    <FollowFlex>
      <div>
        <Link to={`/profile/${username}/following`}>
          <p>
            <span style={{ color: theme.color }}>
              {response.following.length}
            </span>{" "}
            <span>Following</span>
          </p>
        </Link>
      </div>
      <div>
        <Link to={`/profile/${username}/followers`}>
          <p>
            <span style={{ color: theme.color }}>
              {response.followers.length}
            </span>{" "}
            <span>Followers</span>
          </p>
        </Link>
      </div>
    </FollowFlex>
  );
};

export default Follower;
