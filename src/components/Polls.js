import React, { useState, useEffect } from "react";
import {
  useMoralis,
  useNativeBalance,
  useNewMoralisObject,
} from "react-moralis";
//import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import Poll from "react-polls";

// Declaring poll question and answers
const pollQuestion = "Youtube is the best place to learn ?";
const answers = [
  { option: "Yes", votes: 7 },
  { option: "No", votes: 2 },
  { option: "don't know", votes: 1 },
];
let balances = null;
let option_voted = "";
let poll_id = null;
let voter = {};
let poll_title = "";
let poll_options = [];

function Polls({ more }) {
  //
  //const Web3Api = useMoralisWeb3Api();
  //
  const [access, setReg] = useState(false);
  const { refetchUserData, user, isAuthenticated, Moralis } = useMoralis();
  const {
    getBalance,
    data: balance,
    nativeToken,
    isLoading,
  } = useNativeBalance({ chain: "mumbai" });
  const { isSaving, error, save, object } = useNewMoralisObject("Polls");
  //const [access, isRegistered] = useState(true);
  //const { walletAddress, chainId } = useMoralisDapp();

  // Setting answers to state to reload the component with each vote
  const [pollAnswers, setPollAnswers] = useState([...answers]);

  const checkReg = async (_access) => {
    console.log("Voter: ", JSON.stringify(user));

    if (!isAuthenticated) {
      return false;
    } else {
      // reset options
      option_voted = "";
      poll_id = "AvZstBTkxkj7nI517qNWXPym"; //<-- temp objectId to update same row, instead of saving new row
      voter = user.attributes.accounts[0];
      poll_title = pollQuestion;
      poll_options = [];

      console.log("Token Balances: ", JSON.stringify(balance.balance));
      // give access to vote if meets conditions
      _access = balance.balance && balance.balance > 0 && voter ? true : false;
      setReg(_access);
      return _access;
    }
  };

  useEffect(() => {
    checkReg();
  }, [user, balance]);

  const handleVote = async (voteAnswer) => {
    option_voted = voteAnswer;

    const asyncVoteRes = await Promise.all(
      pollAnswers.map(async (answer) => {
        if (answer.option === option_voted) {
          answer.votes = answer.votes + 1;
        }
        return answer;
      })
    );

    console.log("Async", asyncVoteRes);
    poll_options = asyncVoteRes;

    // Poll Class
    // columns: poll_id: uint, poll_options: [{option: "Yes", votes: 7}, {option: "No", votes: 2}], poll_voters: {user_id}
    // OR
    // columns: poll_id: uint, poll_options: {option: "Yes", option: "No", poll_votes: {0:7, 1:2}, poll_voters: {user_id}

    // test db integration
    //create poll
    //
    let poll_data = {
      id: poll_id,
      options: poll_options,
      voted: voter,
    };
    /*     const saveObject = async () => {
      try {
        await save(poll_data);
      } catch (error) {
        console.log("You got an error");
      }
    };
    await saveObject(); */

    const pollObject = new Moralis.Object("Polls");

    pollObject.set("objectId", poll_data.id);
    pollObject.set("options", poll_data.options);
    pollObject.addUnique("voted", poll_data.voted);
    pollObject.save();
  };

  if (!access) {
    return <>{"NO ACCESS"}</>;
  }

  return (
    <>
      <Poll
        question={pollQuestion}
        answers={pollAnswers}
        onVote={handleVote}
        noStorage
      />
    </>
  );
}

export default Polls;
