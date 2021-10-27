import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Like from "../profile/like";
import Retweet from "../profile/retweet";
import Comment from "../profile/comment";
import MessageDisplay from "../profile/messageDisplay";
import Modal from "../modal";
import CommentModal from "../tweet/commentModal";
import Moderate from "../profile/moderate";
import ModerateModal from "../profile/moderateModal";
import { PeopleFlex, UserImage, TweetDetails } from "../styles/profile";
import { isImage, isVideo } from "../../media";
import makeBlockie from 'ethereum-blockies-base64';

const URL = process.env.REACT_APP_SERVER_URL;

const Comments = (props) => {
  const theme = useSelector((state) => state.theme);
  const user = useSelector((state) => state.profile.user);
  const myId = user.account;
  const [tweetId, setTweetId] = useState(null);
  const [tweetIdx, setTweetIdx] = useState(null);
  const [threadAuthor, setThreadAuthor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);

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
  const handleModerationClose = () => {
    setIsModerationModalOpen(false);
  };

  return (
    <div>
      {isModalOpen && (
        <Modal
          children={
            <CommentModal handleClose={handleClose} tweetId={tweetId} threadAuthor={threadAuthor} />
          }
          handleClose={handleClose}
          padding="15px"
        />
      )}
      {isModerationModalOpen && (
        <Modal
          heading="Post Moderation"
          children={
            <ModerateModal 
              handleClose={handleModerationClose} 
              tweet={props.comments[tweetIdx]} 
            />
          }
          handleClose={handleModerationClose}
          padding="15px"
        />
      )}
      {props.comments.map((comment, idx) => {
        if (comment.disputed && comment.ruling == "Reject" && comment.moderations[0].closed) {
          return null;
        }
        const date = new Date(comment.creationTime * 1000);
        return (
          <PeopleFlex hover key={comment.id} tweetHov={theme.tweetHov}>
            <div>
              <UserImage src={makeBlockie(comment.author.id)} />
            </div>
            <div style={{ width: "80%" }}>
              <TweetDetails color={theme.color}>
                {/* <object> to hide nested <a> warning */}
                <object>
                  <Link to={`/profile/${comment.author.id}`}>
                    <h3>
                      {comment.author.id.substring(0, 10) + "..."}
                    </h3>
                  </Link>
                </object>
                <p>@{comment.author.id.substring(0, 10) + "..."}</p>
                <span>
                  {date.toLocaleString("default", { month: "long" })}{" "}
                  {date.getDate()}{" "}
                  {new Date().getFullYear() !== date.getFullYear() &&
                    date.getFullYear()}
                </span>
              </TweetDetails>
              <MessageDisplay tweet={comment}/>
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
              <TweetDetails style={{ justifyContent: "space-between" }}>
                <Comment
                  tweets={props.comments}
                  tweet={comment}
                  idx={idx}
                  myId={myId}
                  getData={() => {}}
                  onClick={(e) => {
                    e.preventDefault();
                    setTweetId(comment.id);
                    setTweetIdx(idx);
                    setThreadAuthor(props.threadAuthor);
                    console.log(comment.id);
                    setIsModalOpen(true);
                  }}
                />
                <Retweet
                  tweets={props.comments}
                  tweet={comment}
                  idx={idx}
                  updateDetails={updateDetails}
                  myId={myId}
                  getData={() => {}}
                />
                <Like
                  tweets={props.comments}
                  tweet={comment}
                  idx={idx}
                  updateDetails={updateDetails}
                  myId={myId}
                  getData={() => {}}
                />
                <Moderate
                  tweets={props.comments}
                  tweet={comment}
                  idx={idx}
                  updateDetails={updateDetails}
                  myId={myId}
                  showModerationModal={() => {
                    setTweetIdx(idx);
                    setIsModerationModalOpen(true);
                  }}
                />
              </TweetDetails>
            </div>
          </PeopleFlex>
        );
      })}
    </div>
  );
};

export default Comments;
