import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Select from 'react-select';
import { toast } from "react-toastify";
import UploadButton from "../uploadButton";
import { Flex, Button } from "../styles/modal";
import { SET_UPDATE } from "../../redux/actions";
import { ethers } from "ethers";
import socialContractAbi from "../../abi/Social.json";
import { socialAddress } from "../../contracts";
import makeBlockie from 'ethereum-blockies-base64';

const TweetModal = (props) => {
  const dropdownCustomStyles = {
    menu: (provided, state) => ({
      ...provided,
      width: state.selectProps.width,
      color: "rgb(255,255,255)",
      backgroundColor: "rgb(26,22,30)",
      border: "1px solid rgb(29, 161, 242)"
    }),
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "rgb(26,22,30)",
      border: "1px solid rgb(29, 161, 242)"
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isFocused ? "rgb(56,52,60)" : undefined
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: "rgb(255,255,255)"
    })
  }

  const [text, setText] = useState("");
  const [rulesSelected, setRulesSelected] = useState("");
  const [isTweetDisabled, setIsTweetDisabled] = useState(true);
  const [rulesID, setRulesID] = useState(0);
  const [preview, setPreview] = useState({ image: "", video: "", media: null });

  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const { handleClose, rows } = props;

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const url = reader.readAsDataURL(file);
    const isImage = file.type.includes("image");

    reader.onloadend = () => {
      isImage
        ? setPreview({ image: reader.result, video: "", media: file })
        : setPreview({ image: "", video: reader.result, media: file });
    };
  };

  return (
    <React.Fragment>
      <Flex bg={theme.bg} color={theme.color}>
        <div>
          <img
            src={makeBlockie(user.account)}
            width="49px"
            height="49px"
            style={{ borderRadius: "10%" }}
          />
        </div>
        <div style={{ width: "100%" }}>
          <textarea
            rows={rows || 5}
            placeholder="What's happening?"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.value && rulesSelected != ""
                ? setIsTweetDisabled(false)
                : setIsTweetDisabled(true);
            }}
          ></textarea>
          <div style={{ marginBottom: "10px" }}>
            {preview.image && (
              <img src={preview.image} style={{ width: "100%" }} />
            )}
            {preview.video && (
              <video
                src={preview.video}
                style={{ width: "100%" }}
                controls
              ></video>
            )}
          </div>
          <Flex style={{ alignItems: "center", justifyContent: "flex-end" }}>
            <div>
              <label htmlFor="photo">
                <UploadButton />
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*,video/*"
                onChange={handlePhoto}
                style={{ display: "none" }}
              />
            </div>
            <div>
            <Select
              styles={dropdownCustomStyles}
              options={[
                { value: 'polite', label: 'Be nice' },
                { value: 'memes', label: 'Only memes' },
                { value: 'nsfw', label: 'NSFW' }
              ]}
              placeholder="Policy..."
              onChange={(optionSelected) => {
                setRulesSelected(optionSelected.value);
                if (optionSelected.value != "" && text != "") setIsTweetDisabled(false);
              }}
            />
            </div>
            <div>
              <Button
                onClick={async () => {
                  setIsTweetDisabled(true);
                  // preview.media preview.video preview.image
                  const social = new ethers.Contract(socialAddress, socialContractAbi, user.signer);
                  await social.post(text, rulesID);

                  setIsTweetDisabled(false);
                  setText("");
                  setPreview({ image: "", video: "", media: null });
                  toast("Your post was submitted");
                  dispatch({ type: SET_UPDATE });
                  handleClose && handleClose();
                }}
                disabled={isTweetDisabled}
                defaultBg={theme.defaultBg}
                darkBg={theme.darkBg}
              >
                Post
              </Button>
            </div>
          </Flex>
        </div>
      </Flex>
    </React.Fragment>
  );
};

export default TweetModal;
