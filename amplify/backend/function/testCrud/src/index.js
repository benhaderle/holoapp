/* Amplify Params - DO NOT EDIT
	API_NOTESAPP_GRAPHQLAPIENDPOINTOUTPUT
	API_NOTESAPP_GRAPHQLAPIIDOUTPUT
	API_NOTESAPP_GRAPHQLAPIKEYOUTPUT
	API_NOTESAPP_NOTETABLE_ARN
	API_NOTESAPP_NOTETABLE_NAME
	ENV
	REGION
	STORAGE_IMAGESTORAGE_BUCKETNAME
Amplify Params - DO NOT EDIT */

const axios = require('axios');
const gql = require('graphql-tag');
const graphql = require('graphql');
const { print } = graphql;

const createNote = gql`
  mutation createNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      name
      description
      image
    }
  }
`

exports.handler = async (event) => {
  try {
    const graphqlData = await axios({
      url: process.env.API_URL,
      method: 'post',
      headers: {
        'x-api-key': process.env.API_<YOUR_API_NAME>_GRAPHQLAPIKEYOUTPUT
      },
      data: {
        query: print(createNote),
        variables: {
          input: {
            name: "Hello world!",
            description: "My first todo"
          }
        }
      }
    });
    const body = {
      message: "successfully created todo!"
    }
    return {
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
          "Access-Control-Allow-Origin": "*",
      }
    }
  } catch (err) {
    console.log('error creating todo: ', err);
  } 
}
