import React, { useState } from "react";
import { useSelector } from "react-redux";
import Icon from "../icon";
import { ethers } from "ethers";
import { Text } from "../styles/profile";
import { ActivityBox, ActivityIcon } from "../styles/common";

const Moderate = (props) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const user = useSelector((state) => state.profile.user);

  const { tweets, tweet, idx, updateDetails, myId, showModerationModal } = props;
  const reportPath = [
    "M31.46 6H16.54L6 16.54v14.91L16.54 42h14.91L42 31.46V16.54L31.46 6zM24 34.6c-1.43 0-2.6-1.16-2.6-2.6 0-1.43 1.17-2.6 2.6-2.6 1.43 0 2.6 1.16 2.6 2.6 0 1.44-1.17 2.6-2.6 2.6zm2-8.6h-4V14h4v12z",
  ];
  const klerosPath = [
    "M15.6356 1L42.4109 2.19704L53.2512 26.288L37.9576 48.3055L11.0367 46.5812L0 20.4788L15.6356 1ZM35.2655 14.8866L15.8604 23.3666L32.4506 36.1964L35.2655 14.8866ZM33.0188 10.6374L17.511 3.95872L14.2534 18.0009L33.0188 10.6374ZM29.0882 39.4245L12.2342 27.3872L12.6418 43.6985L29.0882 39.4245ZM50.5592 26.2349L39.0741 14.5781L36.0427 36.9936L50.5592 26.2349ZM33.0397 42.0464L18.8256 45.7623L35.5413 46.8329L33.0397 42.0464ZM48.3148 31.5236L35.8723 40.7944L38.3447 45.6271L48.3148 31.5236ZM42.4294 5.56301L40.0127 10.5252L49.008 19.6709L42.4294 5.56301ZM39.4184 3.18844L23.6224 2.54712L36.6522 8.24748L39.4184 3.18844ZM13.3289 5.48314L2.26489 19.4568L9.66208 21.024L13.3289 5.48314ZM9.21605 23.7651L1.78321 22.1911L9.5388 40.466L9.21605 23.7651Z",
  ];

  const handleModeration = async () => {
    setButtonDisabled(true);
    showModerationModal();
    setButtonDisabled(false);
  };

  let ongoingModeration = true;
  let displayAmount = "";
  if (!tweet.disputed) {
    if (tweet.moderations.length == 0) {
      ongoingModeration = false;
    } else {
      const moderation = tweet.moderations[0];
      if (moderation.closed) {
        ongoingModeration = false;
      } else if (Date.now() / 1000 < moderation.bondDeadline) {
        const amountPaid = moderation.rounds[0].amountPaid;
        const amountAuthor = ethers.BigNumber.from(amountPaid[1]
        );
        const amountSnitch = ethers.BigNumber.from(amountPaid[2]
        );
        const winningAmount = amountAuthor.gt(amountSnitch) ? amountAuthor : amountSnitch;
        displayAmount = `$${ethers.utils.formatEther(winningAmount)}`;
      } else {
        // Market needs to be resolved
      }
    }
  }

  if (ongoingModeration) {
    return (
      <ActivityBox
        onClick={(event) => handleModeration()}
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
