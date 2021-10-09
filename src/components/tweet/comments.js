import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { PeopleFlex, UserImage, TweetDetails } from "../styles/profile";
import { isImage, isVideo } from "../../media";
import makeBlockie from 'ethereum-blockies-base64';

const URL = process.env.REACT_APP_SERVER_URL;

const Comments = (props) => {
  const theme = useSelector((state) => state.theme);

  return (
    <div>
      {props.comments.map((comment) => {
        const date = new Date(comment.creationTime * 1000);
        return (
          <PeopleFlex hover key={comment.id} border={theme.border}>
            <div>
              <UserImage src={makeBlockie(comment.author.id)} />
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
