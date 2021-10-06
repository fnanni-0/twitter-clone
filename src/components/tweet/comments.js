import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "../loading";
import { PeopleFlex, UserImage, TweetDetails } from "../styles/profile";
import { isImage, isVideo } from "../../media";
const { GraphQLClient, gql } = require('graphql-request');
const graph = new GraphQLClient("https://api.thegraph.com/subgraphs/name/fnanni-0/social_kovan");

const URL = process.env.REACT_APP_SERVER_URL;

const Comments = () => {
  const [comments, setComments] = useState(null);
  const { tweetId } = useParams();
  const refresh = useSelector((state) => state.update.refresh);
  const theme = useSelector((state) => state.theme);

  useEffect(() => {
    (async () => {
      try {
        const { postComments } = await graph.request(
          gql`
            query postsQuery($rootPostID: String) {
              posts(where: {groupID: $rootPostID}, orderBy: id, orderDirection: desc, first: 1000) {
                id
                message
                creationTime
                disputed
                totalComments
                author {
                  id
                }
                comments {
                  id
                }
              }
            }
          `,
          {
            rootPostID: tweetId
          }
        );
        console.log(postComments);
        setComments(postComments);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [refresh]);

  if (!comments) return <Loading />;
  return (
    <div>
      {comments.map((comment) => {
        const date = new Date(comment.creationTime);
        return (
          <PeopleFlex hover key={comment.id} border={theme.border}>
            <div>
              <UserImage src={comment.id} />
            </div>
            <div style={{ width: "100%" }}>
              <TweetDetails color={theme.color}>
                {/* <object> to hide nested <a> warning */}
                <object>
                  <Link to={`/profile/${comment.author.id}`}>
                    <h3>
                      {comment.author.id}
                    </h3>
                  </Link>
                </object>
                <p>@{comment.author.id}</p>
                <span>
                  {date.toLocaleString("default", { month: "long" })}{" "}
                  {date.getDate()}{" "}
                  {new Date().getFullYear() !== date.getFullYear() &&
                    date.getFullYear()}
                </span>
              </TweetDetails>
              <div style={{color:theme.color}}>{comment.message}</div>
              {comment["Comments.media"] &&
                isImage(comment["Comments.media"]) && (
                  <img
                    src={comment["Comments.media"]}
                    style={{ width: "100%" }}
                  />
                )}
              {comment["Comments.media"] &&
                isVideo(comment["Comments.media"]) && (
                  <video
                    src={comment["Comments.media"]}
                    style={{ width: "100%" }}
                    controls
                  ></video>
                )}
            </div>
          </PeopleFlex>
        );
      })}
    </div>
  );
};

export default Comments;
