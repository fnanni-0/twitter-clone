import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProfileHeader from "../profileHeader";
import Tabs from "../tabs";
import {
  PeopleFlex,
  PeopleDetails,
  EmptyMsg,
  UserImage,
} from "../styles/profile";
import { ProfileCorner, Button } from "../styles/common";
import Loading from "../loading";
import { SET_UPDATE } from "../../redux/actions";
const { GraphQLClient, gql } = require('graphql-request');
const graph = new GraphQLClient("https://api.thegraph.com/subgraphs/name/fnanni-0/social_kovan");

const URL = process.env.REACT_APP_SERVER_URL;

const Follow = () => {
  const [userData, setUserData] = useState(null);
  const [followDisabled, setFollowDisabled] = useState(false);

  const { username, activity } = useParams();
  const user = useSelector((state) => state.profile.user);
  const refresh = useSelector((state) => state.update.refresh);
  const theme = useSelector((state) => state.theme);
  const myId = user.id;
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const { profile } = await graph.request(
          gql`
            query profileQuery($account: String) {
              profile(id: $account) {
                id
                followers(first: 10) {
                  id
                }
                following(first: 10) {
                  id
                }
                totalFollowers
                totalFollowing
              }
            }
          `,
          {
            account: username
          }
        );
        setUserData({
          user: profile,
          following: profile.following.map((item) => ({
            ...item,
            unfollow: false,
          })),
          followers: profile.followers.map((item) => ({
            ...item,
            unfollow: false,
          })),
        });
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const handleFollow = async (e, id, idx, follow) => {
    e.preventDefault();
    setFollowDisabled(true);
    await axios.post(
      `${URL}/follow`,
      {
        followedId: id,
        followerId: myId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setUserData({
      ...userData,
      [activity]: [
        ...userData[activity].slice(0, idx),
        {
          ...userData[activity][idx],
          isFollowing: follow,
          unfollow: follow,
        },
        ...userData[activity].slice(idx + 1),
      ],
    });
    setFollowDisabled(false);
    dispatch({ type: SET_UPDATE });
  };

  const handleMouseOver = (idx) => {
    setUserData({
      ...userData,
      [activity]: [
        ...userData[activity].slice(0, idx),
        {
          ...userData[activity][idx],
          unfollow: !userData[activity][idx].unfollow,
        },
        ...userData[activity].slice(idx + 1),
      ],
    });
  };

  const tabList = [
    {
      name: "followers",
      title: "Followers",
      path: "/followers",
    },
    {
      name: "following",
      title: "Following",
      path: "/following",
    },
  ];

  if (!userData) return <Loading />;

  return (
    <ProfileCorner border={theme.border}>
      <ProfileHeader
        heading={`${userData.user.id}`}
        text={`@${userData.user.id}`}
      />
      <Tabs tabList={tabList} />
      {!userData[activity].length ? (
        <EmptyMsg>
          {activity === "following"
            ? `@${username} doesn't follow anyone!`
            : `@${username} has no followers!`}
        </EmptyMsg>
      ) : (
        <div>
          {userData[activity].map((item, idx) => (
            <Link key={item.id} to={`/profile/${item.username}`}>
              <PeopleFlex
                key={item.id}
                border={theme.border}
                tweetHov={theme.tweetHov}
              >
                <div>
                  <UserImage src={item.avatar} />
                </div>
                <div style={{ width: "100%" }}>
                  <PeopleDetails>
                    <div>
                      <object>
                        <Link to={`/profile/${item.username}`}>
                          <h3 style={{ color: theme.color }}>
                            {item.firstname} {item.lastname}
                          </h3>
                        </Link>
                      </object>
                      <object>
                        <Link to={`/profile/${item.username}`}>
                          <p>@{item.username}</p>
                        </Link>
                      </object>
                    </div>
                    {item.id !== myId && (
                      <React.Fragment>
                        {item.isFollowing && (
                          <Button
                            disabled={followDisabled}
                            onMouseEnter={() => handleMouseOver(idx)}
                            onMouseLeave={() => handleMouseOver(idx)}
                            onClick={(e) =>
                              handleFollow(e, item.id, idx, false)
                            }
                            bg="rgb(29, 161, 242)"
                            hoverBg="rgb(202,32,85)"
                            color="rgb(255,255,255)"
                            padding="2% 5%"
                          >
                            {item.unfollow ? "Unfollow" : "Following"}
                          </Button>
                        )}
                        {!item.isFollowing && (
                          <Button
                            disabled={followDisabled}
                            onClick={(e) => handleFollow(e, item.id, idx, true)}
                            bg="transparent"
                            hoverBg="rgba(29, 161, 242,0.1)"
                            color="rgb(29, 161, 242)"
                            padding="2% 5%"
                            border="1px solid rgb(29,161,242)"
                          >
                            Follow
                          </Button>
                        )}
                      </React.Fragment>
                    )}
                  </PeopleDetails>
                  <div>
                    <p style={{color: theme.color}}>{item.bio}</p>
                  </div>
                </div>
              </PeopleFlex>
            </Link>
          ))}
        </div>
      )}
    </ProfileCorner>
  );
};

export default Follow;
