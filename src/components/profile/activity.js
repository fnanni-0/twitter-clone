import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Like from "./like";
import Retweet from "./retweet";
import Comment from "./comment";
import {
  PeopleFlex,
  TweetDetails,
  EmptyMsg,
  User,
  UserImage,
} from "../styles/profile";
import { isImage, isVideo } from "../../media";
import Loading from "../loading";
import Bookmark from "./bookmark";
import Modal from "../modal";
import CommentModal from "../tweet/commentModal";
import makeBlockie from 'ethereum-blockies-base64';
const { GraphQLClient, gql } = require('graphql-request');
const graph = new GraphQLClient("https://api.thegraph.com/subgraphs/name/fnanni-0/social_kovan");

const URL = process.env.REACT_APP_SERVER_URL;

const Activity = (props) => {
  const [tweets, setTweets] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tweetId, setTweetId] = useState(null);
  const [threadAuthor, setThreadAuthor] = useState(null);

  const { username } = useParams();
  const user = useSelector((state) => state.profile.user);
  const myId = user.account;
  const refresh = useSelector((state) => state.update.refresh);
  const theme = useSelector((state) => state.theme);

  const {
    url,
    dataKey,
    header,
    handleHeaderText,
    feed,
    removeBookmark,
    isBookmark,
  } = props;

  useEffect(() => {
    // ComponentDidMount
    getData();
  }, [url, refresh]);

  const getData = async () => {
    try {
      let posts;
      if (username) {
        const query = await graph.request(
          gql`
            query postsQuery($account: String) {
              profile(id: $account) {
                posts(where: {groupID: null}, orderBy: id, orderDirection: desc, first: 100) {
                  id
                  message
                  creationTime
                  disputed
                  totalComments
                  author {
                    id
                  }
                  threadMainPost {
                    author {
                      id
                    }
                  }
                }
              }
            }
          `,
          {
            account: username
          }
        );
        posts = query.profile.posts;
      } else {
        const query = await graph.request(
          gql`
            query postsQuery {
              posts(where: {groupID: null}, orderBy: id, orderDirection: desc, first: 1000) {
                id
                message
                creationTime
                disputed
                totalComments
                author {
                  id
                }
                threadMainPost {
                  author {
                    id
                  }
                }
                comments {
                  id
                }
              }
            }
          `
        );
        posts = query.posts;
      }
      setTweets(posts);
      handleHeaderText &&
        handleHeaderText(`${posts.length} ${header}`);
    } catch (err) {
      console.log(err);
    }
  };

  const updateDetails = (idx, newState) => {
    // setTweets([
    //   ...tweets.slice(0, idx),
    //   {
    //     ...tweets[idx],
    //     [newState[0][0]]: newState[0][1],
    //     [newState[1][0]]: newState[1][1],
    //   },
    //   ...tweets.slice(idx + 1),
    // ]);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  if (!tweets) return <Loading />;

  if (isBookmark && !tweets.length)
    return (
      <div style={{ textAlign: "center", padding: "40px 0px" }}>
        <h3 style={{ fontSize: "19px", fontWeight: 700, color: theme.color }}>
          You haven’t added any Tweets to your Bookmarks yet
        </h3>
        <p>When you do, they’ll show up here.</p>
      </div>
    );

  if (!tweets.length)
    return (
      <EmptyMsg>
        {feed
          ? "You are all caught up!"
          : `@${username} has no ${dataKey} yet!`}
      </EmptyMsg>
    );
  return (
    <React.Fragment>
      {isModalOpen && (
        <Modal
          children={
            <CommentModal handleClose={handleClose} tweetId={tweetId} threadAuthor={threadAuthor} />
          }
          handleClose={handleClose}
          padding="15px"
        />
      )}
      {tweets.map((tweet, idx) => {
        const date = new Date(tweet.creationTime * 1000);
        return (
          <React.Fragment key={tweet.id}>
            <Link
              key={tweet.id}
              to={`/${tweet.author.id}/status/${tweet.id}`}
            >
              <PeopleFlex hover border={theme.border} tweetHov={theme.tweetHov}>
                <User>
                  <UserImage src={makeBlockie(tweet.author.id)}/>
                </User>
                <div style={{ width: "80%" }}>
                  <TweetDetails color={theme.color}>
                    {/* <object> to hide nested <a> warning */}
                    <object>
                      <Link to={`/profile/${tweet.author.id}`}>
                        <h3>
                          {tweet.author.id.substring(0, 10) + "..."}
                        </h3>
                      </Link>
                    </object>
                    <p
                      style={{
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        maxWidth: "18%",
                      }}
                    >
                      @{tweet.author.id.substring(0, 10) + "..."}
                    </p>
                    <span>
                      {date.toLocaleString("default", { month: "short" })}{" "}
                      {date.getDate()}{" "}
                      {new Date().getFullYear() !== date.getFullYear() &&
                        date.getFullYear()}
                    </span>
                  </TweetDetails>
                  <div style={{ color: theme.color }}>
                    {tweet.message}
                  </div>
                  {tweet["Tweets.media"] && isImage(tweet["Tweets.media"]) && (
                    <img
                      src={tweet["Tweets.media"]}
                      style={{ width: "100%" }}
                    />
                  )}
                  {tweet["Tweets.media"] && isVideo(tweet["Tweets.media"]) && (
                    <video
                      src={tweet["Tweets.media"]}
                      style={{ width: "100%" }}
                      controls
                    ></video>
                  )}
                  <TweetDetails style={{ justifyContent: "space-between" }}>
                    <Comment
                      tweets={tweets}
                      tweet={tweet}
                      idx={idx}
                      myId={myId}
                      getData={getData}
                      onClick={(e) => {
                        e.preventDefault();
                        setTweetId(tweet.id);
                        setThreadAuthor(tweet.threadMainPost.author.id);
                        console.log(tweet.id);
                        setIsModalOpen(true);
                      }}
                    />

                    <Retweet
                      tweets={tweets}
                      tweet={tweet}
                      idx={idx}
                      updateDetails={updateDetails}
                      myId={myId}
                      getData={getData}
                    />
                    <Like
                      tweets={tweets}
                      tweet={tweet}
                      idx={idx}
                      updateDetails={updateDetails}
                      myId={myId}
                      getData={getData}
                    />
                    <Bookmark
                      tweet={tweet}
                      myId={myId}
                      removeBookmark={removeBookmark}
                    />
                  </TweetDetails>
                </div>
              </PeopleFlex>
            </Link>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

export default Activity;
