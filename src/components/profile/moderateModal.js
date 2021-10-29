import React, { useState } from "react";
import { useSelector } from "react-redux";
import Icon from "../icon";
import { Text } from "../styles/profile";
import { Flex, Button } from "../styles/modal";
import { ethers } from "ethers";
import socialContractAbi from "../../abi/Social.json";
import arbitratorContractAbi from "../../abi/Arbitrator.json";
import { socialAddress, arbitratorAddress, POHAddress } from "../../contracts";

const URL = process.env.REACT_APP_SERVER_URL;

const Party = {
  NONE: "None",
  AUTHOR: "Accept",
  SNITCH: "Reject"
};
Object.freeze(Party);

function NewlineText(props) {
  const text = props.text;
  const textColor = props.color;
  const newText = text.split('\n').map(str => <p style={{ color: textColor }}>{str}</p>);
  
  return newText;
}

const ModerateModal = (props) => {
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [depositRequired, setdepositRequired] = useState(ethers.BigNumber.from(0));
  const [agree, setAgree] = useState(false);

  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);
  const social = new ethers.Contract(socialAddress, socialContractAbi, user.signer);
  const arbitrator = new ethers.Contract(arbitratorAddress, arbitratorContractAbi, user.signer);

  const { tweet, handleClose } = props;
  console.log(tweet.moderations);

  const checkboxHandler = () => {
    setButtonDisabled(agree);
    setAgree(!agree);
  }

  const loadData = async () => {
    if (depositRequired.eq(ethers.BigNumber.from(0))) {
      const extraData = await social.arbitratorExtraData();
      const arbitrationCost = await arbitrator.arbitrationCost(extraData);
      const totalCost = arbitrationCost.mul(3).div(2);

      if (tweet.moderations.length == 0) {
        setdepositRequired(totalCost.div(16));
      } else if (tweet.moderations[0].closed) {
        setdepositRequired(totalCost.div(16));
      } else {
        const amountAuthor = ethers.BigNumber.from(
          tweet.moderations[0].rounds[0].amountPaid[1]
        );
        const amountSnitch = ethers.BigNumber.from(
          tweet.moderations[0].rounds[0].amountPaid[2]
        );
        const currentAmount = amountAuthor.gt(amountSnitch) ? amountAuthor : amountSnitch;
        const currentLoserAmount = amountAuthor.gt(amountSnitch) ? amountSnitch : amountAuthor;
        const totalRequired = currentAmount.mul(2).gt(totalCost) ? totalCost : currentAmount.mul(2);
        setdepositRequired(
          totalRequired.sub(currentLoserAmount
          )
        );
      }
    }
  }

  const reportPost = async (e, idx) => {
    e.preventDefault();
    setButtonDisabled(true);
    await social.moderatePost(tweet.id, 2, {
      value: depositRequired
    });

    setButtonDisabled(false);
    handleClose();
  };

  const supportPost = async (e, idx) => {
    e.preventDefault();
    setButtonDisabled(true);
    await social.moderatePost(tweet.id, 1, {
      value: depositRequired
    });

    setButtonDisabled(false);
    handleClose();
  };

  const resolveMarket = async (e, idx) => {
    e.preventDefault();
    setButtonDisabled(true);
    await social.resolveModerationMarket(tweet.id);

    setButtonDisabled(false);
    handleClose();
  };

  let canUpvote = false;
  let canDownvote = false;
  let amountPaidAuthor = 0;
  let amountPaidSnitch = 0;
  let firstModerationEvent = false;
  let timeRemaining = null;
  const currentTime = Date.now() / 1000;
  if (!tweet.disputed) {
    if (tweet.moderations.length == 0) {
      canDownvote = true;
      firstModerationEvent = true;
    } else {
      const moderation = tweet.moderations[0];
      if (moderation.closed) {
        firstModerationEvent = true;
        if (moderation.currentWinner == Party.SNITCH) {
          canUpvote = true;
        } else {
          canDownvote = true;
        }
      } else if (currentTime < moderation.bondDeadline) {
        const round = moderation.rounds[0];
        amountPaidAuthor = round.amountPaid[1];
        amountPaidSnitch = round.amountPaid[2];
        if (ethers.BigNumber.from(amountPaidAuthor).lt(ethers.BigNumber.from(amountPaidSnitch))) {
          canUpvote = true;
        } else {
          canDownvote = true;
        }
        timeRemaining = moderation.bondDeadline - currentTime;
      }
    }
  }

  loadData();

  if (tweet.disputed) {
    // If dispute is ongoing, go to centralized arbitrator.
    // window.open("https://centralizedarbitrator.netlify.app/");
    return (
      <Flex bg={theme.bg} color={theme.color}>
        <div style={{ width: "100%" }}>
          <p style={{ color: theme.color }}>{bodyText}</p>
          <div>
            <input type="checkbox" id="agree" onChange={checkboxHandler} />
            <label htmlFor="agree" style={{ color: theme.color }}> I understand that I can lose my deposit.</label>
          </div>
          <Flex style={{ alignItems: "center", justifyContent: "flex-end" }}>
            <div>
              <Button
                onClick={handleModeration}
                disabled={buttonDisabled}
                defaultBg={theme.defaultBg}
                darkBg={theme.darkBg}
              >
                Report
              </Button>
            </div>
          </Flex>
        </div>
      </Flex>
    );
  } else if (canUpvote) {
    // If moderation market is already open, explain what is happening and show current stake.const bodyText = `In order to report this post, a deposit of at least ${ethers.utils.formatEther( depositRequired )} DAI is required. The defendant party has then 24 hours to double the deposit. If it does, the post is considered valid again until someone doubles the deposit in favor of the plaintiff. After a few rounds a Kleros dispute is raised. The winner side gets reimburse and earns the loser's deposit.`;
    let bodyText;
    if (firstModerationEvent) {
      bodyText = `In order to support this post validity, a deposit of at least ${ethers.utils.formatEther(depositRequired)} DAI is required. The reporter's side has then 24 hours to double the deposit. If it does, the post is considered reported again until someone doubles the deposit in favor of the author. After a few rounds a Kleros dispute is raised. The winner side gets reimburse and earns the loser's deposit.`;
    } else if (timeRemaining == null) {
      bodyText = "Time's up! You can create a new moderation market, but first close the current one."
      return (
        <Flex bg={theme.bg} color={theme.color}>
          <div style={{ width: "100%" }}>
            <NewlineText color={theme.color} text={bodyText} />
            <Flex style={{ alignItems: "center", justifyContent: "flex-end" }}>
              <div>
                <Button
                  onClick={resolveMarket}
                  defaultBg={theme.defaultBg}
                  darkBg={theme.darkBg}
                >
                  Resolve market
                </Button>
              </div>
            </Flex>
          </div>
        </Flex>
      );
    } else {
      const hours = Math.floor(timeRemaining / (60 * 60));
      const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
      bodyText = `Author's stake:   ${ethers.utils.formatEther(amountPaidAuthor)} DAI.\n
                  Reporter's stake: ${ethers.utils.formatEther(amountPaidSnitch)} DAI.\n
                  Time remaining: ${hours}h ${minutes}m.\n
                  In order to stake in favour of the author's side, a deposit of at least ${ethers.utils.formatEther(depositRequired)} DAI is required.`;
    }
    
    return (
      <Flex bg={theme.bg} color={theme.color}>
        <div style={{ width: "100%" }}>
          <NewlineText color={theme.color} text={bodyText} />
          <div>
            <input type="checkbox" id="agree" onChange={checkboxHandler} />
            <label htmlFor="agree" style={{ color: theme.color }}> I understand that I can lose my deposit.</label>
          </div>
          <Flex style={{ alignItems: "center", justifyContent: "flex-end" }}>
            <div>
              <Button
                onClick={supportPost}
                disabled={buttonDisabled}
                defaultBg={theme.defaultBg}
                darkBg={theme.darkBg}
              >
                Support post
              </Button>
            </div>
          </Flex>
        </div>
      </Flex>
    );
  } else {
    // If first report, explain what is happening.
    let bodyText;
    if (firstModerationEvent) {
      bodyText = `In order to report this post, a deposit of at least ${ethers.utils.formatEther( depositRequired )} DAI is required. The author's side has then 24 hours to double the deposit. If it does, the post is considered valid again until someone doubles the deposit in favor of the reporter. After a few rounds a Kleros dispute is raised. The winner side gets reimburse and earns the loser's deposit.`;
    } else if (timeRemaining == null) {
      bodyText = "Time's up! You can create a new moderation market, but first close the current one."
      return (
        <Flex bg={theme.bg} color={theme.color}>
          <div style={{ width: "100%" }}>
            <NewlineText color={theme.color} text={bodyText} />
            <Flex style={{ alignItems: "center", justifyContent: "flex-end" }}>
              <div>
                <Button
                  onClick={resolveMarket}
                  defaultBg={theme.defaultBg}
                  darkBg={theme.darkBg}
                >
                  Resolve market
                </Button>
              </div>
            </Flex>
          </div>
        </Flex>
      );
    } else {
      const hours = Math.floor(timeRemaining / (60 * 60));
      const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
      bodyText = `Author's stake:   ${ethers.utils.formatEther(amountPaidAuthor)} DAI.\n
                  Reporter's stake: ${ethers.utils.formatEther(amountPaidSnitch)} DAI.\n
                  Time remaining: ${hours}h ${minutes}m.\n
                  In order to stake in favour of the author's side, a deposit of at least ${ethers.utils.formatEther(depositRequired)} DAI is required.`;
    }
    
    return (
      <Flex bg={theme.bg} color={theme.color}>
        <div style={{ width: "100%" }}>
          <NewlineText color={theme.color} text={bodyText} />
          <div>
            <input type="checkbox" id="agree" onChange={checkboxHandler} />
            <label htmlFor="agree" style={{ color: theme.color }}> I understand that I can lose my deposit.</label>
          </div>
          <Flex style={{ alignItems: "center", justifyContent: "flex-end" }}>
            <div>
              <Button
                onClick={reportPost}
                disabled={buttonDisabled}
                defaultBg={theme.defaultBg}
                darkBg={theme.darkBg}
              >
                Report
              </Button>
            </div>
          </Flex>
        </div>
      </Flex>
    );
  }
};

export default ModerateModal;