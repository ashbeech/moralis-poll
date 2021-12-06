import React, { useState, useEffect, useRef } from "react";
import {
  useMoralis,
  useNativeBalance,
  useNewMoralisObject,
} from "react-moralis";
import Poll from "react-polls";

let saved_account = "";
let new_user = true;

// Declaring poll question and answers
const pollQuestion = "Youtube is the best place to learn ?";
const answers = [
  { option: "Yes", votes: 7 },
  { option: "No", votes: 2 },
  { option: "don't know", votes: 1 },
];
let option_voted = "";
let poll_id = 1;
let voter = {};
let poll_title = "";
let poll_options = [];

function Polls({ more }) {
  //
  const [access, setReg] = useState(false);
  const { isInitialized, refetchUserData, account, isAuthenticated, Moralis } =
    useMoralis();
  //const { switchNetwork, chainId, chain, account } = useChain();
  const {
    getBalance,
    data: balance,
    nativeToken,
    isLoading,
  } = useNativeBalance({ chain: "mumbai" });
  const { isSaving, error, save, object } = useNewMoralisObject("Polls");

  // Setting answers to state to reload the component with each vote
  const [pollAnswers, setPollAnswers] = useState([...answers]);

  const isInitialMount = useRef(true);

  // TODO: Need to display/build Polls data from Moralis instance.
  // 'AvZstBTkxkj7nI517qNWXPym' is static, exisiting example of objectId in db.
  // 👇

  /*   const PollsData = Moralis.Object.extend("Polls");
  const query = new Moralis.Query(PollsData); */

  const updateMonster = async () => {
    const MonsterCreature = Moralis.Object.extend("Polls");
    const query = new Moralis.Query(MonsterCreature);
    //query.equalTo("objectId", "AvZstBTkxkj7nI517qNWXPym");
    query.equalTo("pollId", 1); //<-- temp id/objectId to update same row, instead of saving new row
    const monster = await query.first();

    return monster;
  };

  const checkReg = async (_access) => {
    console.log("Account: ", JSON.stringify(account));

    if (!isAuthenticated) {
      return false;
    } else {
      _access = balance.balance && balance.balance > 0 ? true : false;
      console.log("ACCESS: ", JSON.stringify(_access));
      if (_access) {
        //let poll = await updateMonster(poll_id);
        // reset options
        option_voted = "";
        voter = account;
        poll_title = pollQuestion;
        poll_options = answers; //poll.attributes.options;
        setPollAnswers(poll_options);

        //console.log("Token Balances: ", JSON.stringify(balance.balance));
        //console.log("Poll Data: ", JSON.stringify(poll.attributes.options));

        // give access to vote if meets conditions
        setReg(_access);
        saved_account = account;
      } else {
        // no access
      }

      return _access;
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // Your useEffect code here to be run on update
      console.log("Account:", account);
      console.log("Saved Account:", saved_account);
      console.log("Token Balances: ", JSON.stringify(balance));

      if (isInitialized && balance.balance > 0) {
        if (saved_account !== account) {
          console.log("CHECK REG");
          checkReg();
        }
      } else {
        //saved_account = account;
        setReg(false);
      }
    }
  }, [account, balance, isInitialized]);

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

    // test db integration with static example
    // create poll
    //
    let poll_data = {
      id: poll_id,
      title: poll_title,
      options: poll_options,
      voted: voter,
    };

    const pollObject = new Moralis.Object("Polls");
    pollObject.set("id", poll_data.id);
    pollObject.set("title", poll_data.title);
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
