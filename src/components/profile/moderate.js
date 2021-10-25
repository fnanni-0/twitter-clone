import React, { useState } from "react";
import { useSelector } from "react-redux";
import Icon from "../icon";
import { Text } from "../styles/profile";
import { ActivityBox, ActivityIcon } from "../styles/common";

const URL = process.env.REACT_APP_SERVER_URL;
const Party = {
  NONE: "None",
  AUTHOR: "Accept",
  SNITCH: "Reject"
};
Object.freeze(Party);

const Moderate = (props) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const user = useSelector((state) => state.profile.user);

  const { tweets, tweet, idx, updateDetails, myId, showModerationModal } = props;
  const reportPath = [
    "M31.46 6H16.54L6 16.54v14.91L16.54 42h14.91L42 31.46V16.54L31.46 6zM24 34.6c-1.43 0-2.6-1.16-2.6-2.6 0-1.43 1.17-2.6 2.6-2.6 1.43 0 2.6 1.16 2.6 2.6 0 1.44-1.17 2.6-2.6 2.6zm2-8.6h-4V14h4v12z",
  ];
  const approvePath = [
    "M16,0 L2,0 C0.9,0 0,0.9 0,2 L0,16 C0,17.1 0.9,18 2,18 L16,18 C17.1,18 18,17.1 18,16 L18,2 C18,0.9 17.1,0 16,0 L16,0 Z M7,14 L2,9 L3.4,7.6 L7,11.2 L14.6,3.6 L16,5 L7,14 L7,14 Z",
  ];
  const klerosPath = [
    "M15.6356 1L42.4109 2.19704L53.2512 26.288L37.9576 48.3055L11.0367 46.5812L0 20.4788L15.6356 1ZM35.2655 14.8866L15.8604 23.3666L32.4506 36.1964L35.2655 14.8866ZM33.0188 10.6374L17.511 3.95872L14.2534 18.0009L33.0188 10.6374ZM29.0882 39.4245L12.2342 27.3872L12.6418 43.6985L29.0882 39.4245ZM50.5592 26.2349L39.0741 14.5781L36.0427 36.9936L50.5592 26.2349ZM33.0397 42.0464L18.8256 45.7623L35.5413 46.8329L33.0397 42.0464ZM48.3148 31.5236L35.8723 40.7944L38.3447 45.6271L48.3148 31.5236ZM42.4294 5.56301L40.0127 10.5252L49.008 19.6709L42.4294 5.56301ZM39.4184 3.18844L23.6224 2.54712L36.6522 8.24748L39.4184 3.18844ZM13.3289 5.48314L2.26489 19.4568L9.66208 21.024L13.3289 5.48314ZM9.21605 23.7651L1.78321 22.1911L9.5388 40.466L9.21605 23.7651Z",
  ];

  const handleModeration = async () => {
    setButtonDisabled(true);
    showModerationModal();
    setButtonDisabled(false);
  };

  let canUpvote = false;
  let canDownvote = false;
  let amountPaidAuthor = null;
  let amountPaidSnitch = null;
  let showDispute = false;
  let displayAmount = "";
  const currentTime = Date.now() / 1000;
  if (tweet.disputed) {
    showDispute = true;
  } else {
    if (tweet.moderations.length == 0) {
      canDownvote = true;
    } else {
      const moderation = tweet.moderations[0];
      if (moderation.closed) {
        if (moderation.currentWinner == Party.SNITCH) {
          canUpvote = true;
        } else {
          canDownvote = true;
        }
      } else if (currentTime < moderation.bondDeadline) {
        const round = moderation.rounds[0];
        amountPaidAuthor = round.amountPaid[1] / 1000000000000000;
        amountPaidSnitch = round.amountPaid[2] / 1000000000000000;
        if (amountPaidAuthor < amountPaidSnitch) {
          canUpvote = true;
          displayAmount = `$${amountPaidSnitch}`;
        } else {
          canDownvote = true;
          displayAmount = `$${amountPaidAuthor}`;
        }
      } else {
        // Market needs to be resolved
      }
    }
  }

  if (showDispute) {
    return (
      <ActivityBox
        onClick={(event) => {
          window.open("https://centralizedarbitrator.netlify.app/");
        }}
        disabled={buttonDisabled}
        hoverColor="rgb(124, 26, 199)"
        hoverBg="rgba(124, 26, 199,0.1)"
      >
        <ActivityIcon>
          <Icon
              d={klerosPath}
              width="18.75px"
              height="18.75px"
              viewBox="0 0 50 50"
              fill="rgb(101, 119, 134)"
            /> 
        </ActivityIcon>
      </ActivityBox>
    );
  } else if (canUpvote) {
    return (
      <ActivityBox
        onClick={(event) => handleModeration()}
        disabled={buttonDisabled}
        hoverColor="rgb(50, 160, 80)"
        hoverBg="rgba(50, 160, 80, 0.1)"
      >
        <ActivityIcon>
          <Icon
              d={approvePath}
              width="18.75px"
              height="18.75px"
              viewBox="0 0 20 20"
              fill="rgb(101, 119, 134)"
            /> 
        </ActivityIcon>
        <Text color="rgb(101, 119, 134)">
          {displayAmount}
        </Text>
      </ActivityBox>
    );
  } else {
    return (
      <ActivityBox
        onClick={(event) => handleModeration()}
        disabled={buttonDisabled}
        hoverColor="rgb(200, 30, 60)"
        hoverBg="rgb(200, 30, 60, 0.1)"
      >
        <ActivityIcon>
          <Icon
              d={reportPath}
              width="18.75px"
              height="18.75px"
              viewBox="0 0 48 48"
              fill="rgb(101, 119, 134)"
            /> 
        </ActivityIcon>
        <Text color="rgb(101, 119, 134)">
          {displayAmount}
        </Text>
      </ActivityBox>
    );
  }
};

export default Moderate;
