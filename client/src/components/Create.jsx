import React, { Component } from 'react';
import { LoadingScreen, Img, Button, List, HFive, ListItem } from '../GlobalStyle';
import styled from 'styled-components';
import { Redirect } from 'react-router-dom';

const CreateScreen = styled.div`
  margin: auto;
  margin-top: 0px;
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 2fr 1fr;
`;

const CreateForm = styled.form`
  // display: flex;
  margin-top: 0px;
  grid-column: 1;
  grid-row: 1 / span2;
`;

const DisplayCandidates = styled.div`
  grid-column: 2;
  grid-row: 1;
`;

const DisplayVoters = styled.div`
  grid-column: 2;
  grid-row: 2;
`;

const InputField = styled.div`
  text-align: left;
  padding: 5px;
`;





const Inputs = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  height: 40px;
  width: 200px;
  border-radius: 5px;
  font-family: inherit;
  font-size: 1.1rem;
  border: 0;
  background: #fefefe;
  box-shadow: none;
`;

class Create extends Component {
  state = {
    election: {
      electionName: "",
      expirationTime: "",
      newCandidate: "",
      candidates: [],
      newVoter: "",
      whiteList: []
    },
    electionId: 0,
    voteLoading: false,
    electionConfirmed: false,
    loading: false,
    drizzleState: null
  };

  render() {
    if (this.state.electionConfirmed) {
      return <Redirect to={`/vote/${this.state.electionId}`} />;
    }
    // While waiting for a response, cover page with loadingscreen
    if (this.state.voteLoading) {
      return <LoadingScreen>
        <Img/>
        <HFive>mining a new block - this could take a few minutes...</HFive>
      </LoadingScreen>;
    }
    return (
      // {this.state.voteLoading ? `<LoadingScreen></LoadingScreen>` : ''}
      <CreateScreen>
        {/* <Title>Create new Election</Title> */}
        <CreateForm>
          <Inputs>
            <InputField>
              <label htmlFor="electionName">Election Name</label>
              <br />
              <Input
                name="electionName"
                type="text"
                value={this.state.value}
                onKeyPress={this.handleKeyPress}
                onChange={this.handleChange}
              />
            </InputField>

            <InputField>
              <label htmlFor="expirationTime">Election Length</label>
              <br />
              <Input
                name="expirationTime"
                type="text"
                value={this.state.value}
                onKeyPress={this.handleKeyPress}
                onChange={this.handleChange}
              />
            </InputField>
            <InputField>
              <label htmlFor="newCandidate">
                Add Candidate - hit return to add
              </label>
              <br />
              <Input
                name="newCandidate"
                type="text"
                onKeyPress={this.handleKeyPress}
                onChange={this.handleChange}
              />
            </InputField>
            <InputField>
              <label htmlFor="newVoter">Add Voter - hit return to add</label>
              <br />
              <Input
                name="newVoter"
                type="text"
                onKeyPress={this.handleKeyPress}
                onChange={this.handleChange}
              />
            </InputField>
            <Button center onClick={this.submitElection}>
              START ELECTION
            </Button>
          </Inputs>
        </CreateForm>
        <DisplayCandidates>
          <HFive>Candidates: (Click to remove) </HFive>
          <List>
            {this.state.election.candidates.map(candi => (
              <ListItem
                key={candi}
                onClick={e => this.removeItem(e, "candidates")}
              >
                {candi}
              </ListItem>
            ))}
          </List>
        </DisplayCandidates>
        <DisplayVoters>
          <HFive>Voters (Click to remove):</HFive>
          <List>
            {this.state.election.whiteList.map(voter => (
              <ListItem
                key={voter}
                onClick={e => this.removeItem(e, "whiteList")}
              >
                {voter}
              </ListItem>
            ))}
          </List>
        </DisplayVoters>
      </CreateScreen>
    );
  }

  //         '0x994DD176fA212730D290465e659a7c7D0549e384',
  //         '0xe7BA88433E60C53c69b19f503e00851B98891551'

  handleChange = event => {
    const { value, name } = event.target;
    this.setState(prevState => ({
      election: { ...prevState.election, [name]: value }
    }));
  };

  // prevent default on enter press and add to array in state
  handleKeyPress = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.target.name === "newCandidate") {
        this.addItem(this.state.election.newCandidate, "candidates");
        event.target.value = "";
      }
      if (event.target.name === "newVoter") {
        this.addItem(this.state.election.newVoter, "whiteList");
        event.target.value = "";
      }
    }
  };

  addItem = (item, array) => {
    if (this.state.election[array].includes(item))
      alert("only unique inputs, ese");
    else {
      this.setState(prevState => ({
        election: {
          ...prevState.election,
          [array]: [...prevState.election[array], item]
        }
      }));
    }
  };

  removeItem = (item, array) => {
    const toRemove = item.target.innerHTML;
    const newArray = this.state.election[array].filter(li => li !== toRemove);
    console.log(newArray);
    this.setState(prevState => ({
      election: { ...prevState.election, [array]: newArray }
    }));
  };

  submitElection = async event => {
    event.preventDefault();
    const { election } = this.state;
    if (
      election.electionName &&
      election.expirationTime &&
      election.candidates.length > 0 &&
      election.whiteList.length > 0
    ) {
      const { methods } = this.props.parentState.drizzle.contracts.Vote;
      this.setState({ voteLoading: true });
      const response = await methods
        .startElection(
          election.electionName,
          election.expirationTime * 60,
          election.candidates.map(candiBoi => this.stringTranslate(candiBoi)),
          election.whiteList
        )
        .send()
        .then(() => methods.electionCount().call())
        .then(id => {
          this.setState({ electionConfirmed: true, electionId: id });
        });
    } else {
      alert("please fill out all fields");
    }
  };

  stringTranslate = str => {
    const out = [];
    for (let i = 0; i < str.length; i++) {
      let hex = Number(str.charCodeAt(i)).toString(16);
      out.push(hex);
    }
    return `0x${out.join("")}`;
  };

  handleSubmit = event => {
    event.preventDefault();
    const { value, id } = event.target;
    this.setState({ [id]: value });
  };
}

export default Create;
