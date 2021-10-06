import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { SideBarBox, Header, Users, UserFlex, Button } from "../styles/sidebar";
import Loading from "../loading";
import { SET_UPDATE } from "../../redux/actions";
const { GraphQLClient, gql } = require('graphql-request');
const graph = new GraphQLClient("https://api.thegraph.com/subgraphs/name/fnanni-0/social_kovan");

const URL = process.env.REACT_APP_SERVER_URL;

const SideBar = () => {
  const [whoFollow, setWhoFollow] = useState(null);
  const [isFollowDisabled, setFollowDisabled] = useState(false);

  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);
  const userId = user.account;
  const refresh = useSelector((state) => state.update.refresh);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const { profiles } = await graph.request(
          gql`
            query followingQuery($address: String) {
              profiles(where: {id: $address}, first: 1000) {
                following {
                  id
                }
                totalFollowers
              }
            }
          `,
          {
            address: user.account,
          }
        );
        console.log(profiles[0].following);
        setWhoFollow(profiles[0].following);
        handleHeaderText &&
          handleHeaderText(`${posts.length} ${header}`);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [refresh]);

  const handleFollow = async (e, idx) => {
    e.preventDefault();
    setFollowDisabled(true);
    await axios.post(
      `${URL}/follow`,
      {
        followedId: whoFollow[idx].id,
        followerId: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const res = await axios.get(`${URL}/feed/who-follow?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setWhoFollow(res.data.whoFollow);
    setFollowDisabled(false);
    dispatch({ type: SET_UPDATE });
  };

  if (!whoFollow) return <Loading />;

  return (
    <SideBarBox tweetHov={theme.tweetHov}>
      <Header color={theme.color} border={theme.border}>
        <h2>Who to follow</h2>
      </Header>
      <Users>
        {!whoFollow.length && (
          <p style={{ textAlign: "center", color: theme.color }}>
            No more users left to follow
          </p>
        )}
        {whoFollow.map((user, idx) => (
          <Link to={`/profile/${user.username}`} key={user.id}>
            <UserFlex color={theme.color} border={theme.border}>
              <img src={user.avatar} />
              <div>
                <h3>
                  {user.firstname} {user.lastname}
                </h3>
                <p>@{user.username}</p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Button
                  onClick={(e) => handleFollow(e, idx)}
                  disabled={isFollowDisabled}
                >
                  Follow
                </Button>
              </div>
            </UserFlex>
          </Link>
        ))}
      </Users>
    </SideBarBox>
  );
};

export default SideBar;
