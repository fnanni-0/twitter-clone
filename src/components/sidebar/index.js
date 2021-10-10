import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SideBarBox, Header, Users, UserFlex, Button } from "../styles/sidebar";
import Loading from "../loading";
import { SET_UPDATE } from "../../redux/actions";
import makeBlockie from 'ethereum-blockies-base64';
import { ethers } from "ethers";
import socialContractAbi from "../../abi/Social.json";
import { socialAddress } from "../../contracts";
const { GraphQLClient, gql } = require('graphql-request');
const graph = new GraphQLClient("https://api.thegraph.com/subgraphs/name/fnanni-0/social_kovan");

const URL = process.env.REACT_APP_SERVER_URL;

const SideBar = () => {
  const [whoFollow, setWhoFollow] = useState(null);
  const [isFollowDisabled, setFollowDisabled] = useState(false);

  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);
  const refresh = useSelector((state) => state.update.refresh);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const { profiles } = await graph.request(
          gql`
            query followingQuery($userAccount: String) {
              profiles(where: {id_not: $userAccount}, orderBy: totalFollowers, orderDirection: desc, first: 10) {
                id
                followers(where: {id: $userAccount}) {
                  id
                }
              }
            }
          `,
          {
            userAccount: user.account
          }
        );
        // TODO: compute isFollowing info.
        setWhoFollow(profiles);
        // TODO: show profiles relevant to the context.
      } catch (err) {
        console.log(err);
      }
    })();
  }, [refresh]);

  const handleFollow = async (e, idx) => {
    e.preventDefault();
    setFollowDisabled(true);
    const social = new ethers.Contract(socialAddress, socialContractAbi, user.signer);
    await social.follow([whoFollow[idx].id], [whoFollow[idx].followers.length == 0]);
    // setWhoFollow(res.data.whoFollow);
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
        {whoFollow.map((user, idx) => {
          const followButton = whoFollow[idx].followers.length == 0 ? "Follow" : "Unfollow";
          return (
            <Link to={`/profile/${user.id}`} key={user.id}>
              <UserFlex color={theme.color} border={theme.border}>
                <img src={makeBlockie(user.id)} />
                <div>
                  <h3>
                    {user.id.substring(0, 10) + "..."}
                  </h3>
                  <p>@{user.id.substring(0, 10) + "..."}</p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <Button
                    onClick={(e) => handleFollow(e, idx)}
                    disabled={isFollowDisabled}
                  >
                    {followButton}
                  </Button>
                </div>
              </UserFlex>
            </Link>
          );
        })}
      </Users>
    </SideBarBox>
  );
};

export default SideBar;
