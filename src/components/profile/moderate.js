import React, { useState } from "react";
import { useSelector } from "react-redux";
import { TiArrowDownThick, TiArrowUpThick } from 'react-icons/ti';
import Icon from "../icon";
import { Text } from "../styles/profile";
import { ActivityBox, ActivityIcon } from "../styles/common";

const URL = process.env.REACT_APP_SERVER_URL;

const Moderate = (props) => {
  const [likeDisabled, setLikeDisabled] = useState(false);

  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);
  const upvotePath = [
    "M26.711,20.273l-9.999-9.977  c-0.395-0.394-1.034-0.394-1.429,0v0h0l-9.991,9.97c-0.66,0.634-0.162,1.748,0.734,1.723h19.943  C26.862,22.012,27.346,20.906,26.711,20.273z M15.998,12.433l7.566,7.55H8.432L15.998,12.433z",
  ];
  const downvotePath = [
    "M27,11.106c0-0.564-0.489-1.01-1.044-0.995  H6.013c-0.887-0.024-1.38,1.07-0.742,1.702l9.999,9.9c0.394,0.39,1.031,0.376,1.429,0l9.991-9.892C26.879,11.64,27,11.388,27,11.106  z M15.984,19.591L8.418,12.1H23.55L15.984,19.591z",
  ];
  
  

  const { tweets, tweet, idx, updateDetails, myId, getData } = props;
  console.log(tweet.moderations);

  const handleLike = async (e, idx) => {
    e.preventDefault();
    setLikeDisabled(true);
    if (tweets[idx].selfLiked) {
      try {
        // Thumbs Up
        updateDetails(idx, [
          ["selfLiked", false],
          ["Tweets.likesCount", tweets[idx]["Tweets.likesCount"] - 1],
        ]);
        getData && getData();
        setLikeDisabled(false);
      } catch (err) {
        setLikeDisabled(false);
      }
    } else {
      try {
        // thumbs down
        updateDetails(idx, [
          ["selfLiked", true],
          ["Tweets.likesCount", tweets[idx]["Tweets.likesCount"] + 1],
        ]);
        setLikeDisabled(false);
      } catch (err) {
        setLikeDisabled(false);
      }
    }
  };

  return (
    <div>
      <ActivityBox
        onClick={(event) => handleLike(event, idx)}
        disabled={likeDisabled}
        hoverColor="rgb(50, 160, 80)"
        hoverBg="rgba(50, 160, 80,0.1)"
      >
        <Text color={tweet.selfLiked ? "rgb(50, 160, 80)" : "rgb(101, 119, 134)"}>
          $2
        </Text>
        <ActivityIcon>
          <Icon
            viewBox="0 0 28 28"
            d={upvotePath}
            width="18.75px"
            height="18.75px"
            fill={tweet.selfLiked ? "rgb(50, 160, 80)" : "rgb(101, 119, 134)"}
          />
        </ActivityIcon>
      </ActivityBox>
      <ActivityBox
        onClick={(event) => handleLike(event, idx)}
        disabled={likeDisabled}
        hoverColor="rgb(200, 30, 60)"
        hoverBg="rgba(200, 30, 60,0.1)"
      >
        <Text color={tweet.selfLiked ? "rgb(200, 30, 60)" : "rgb(101, 119, 134)"}>
          $1
        </Text>
        <ActivityIcon>
          <Icon
            viewBox="0 0 28 28"
            d={downvotePath}
            width="18.75px"
            height="18.75px"
            fill={tweet.selfLiked ? "rgb(200, 30, 60)" : "rgb(101, 119, 134)"}
          />
        </ActivityIcon>
      </ActivityBox>
    </div>
  );
};

export default Moderate;