import React, { useState, useEffect } from 'react';
import './App.css';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';


const initialFormState = { name: '', image_URL: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);


  async function createNote() {
  if (!formData.name ) return;
  // if (formData.image_Name) {
  //   console.log(formData.image_Name);
  //   let imageURL = await Storage.get(formData.image_Name);
  //   console.log(imageURL);

  //   setFormData({ ...formData, image_URL: '' });

  // }
  console.log('hey')
  console.log(formData)
  await API.graphql({ 
    query: createNoteMutation,
    variables: { input: formData }
  });
 
  setNotes([ ...notes, formData ]);
  setFormData(initialFormState);
}

  async function deleteNote({ id }) {
  	let deletedNote = notes.find(note=> note.id === id);
  	console.log(deletedNote);
  	await Storage.remove(deletedNote.image_Name);

    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ 
      query: deleteNoteMutation,
      variables: { input: { id }}
    });
  }

  async function fetchNotes() {
  const apiData = await API.graphql({ query: listNotes });
  const notesFromAPI = apiData.data.listNotes.items;

  await Promise.all(notesFromAPI.map(async note => {
    if (note.image_Name) {
      const image_URL = await Storage.get(note.image_Name);


      note.image_URL = image_URL;
      console.log(note.image_Name);
      console.log(note.image_Name);

    }
    return note;
  }))
  setNotes(apiData.data.listNotes.items);
}

  async function onChange(e) {
  if (!e.target.files[0]) return
  const file = e.target.files[0];

  setFormData({ ...formData, image_Name: "resized/" + file.name });
  await Storage.put("original/" + file.name, file);
  fetchNotes();
}

  return (
    <div className="App">
      <h1>HOLOSCOPE</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="img name"
        value={formData.name}
      />
      <input
        type="file"
        onChange={onChange}
      />
      <button onClick={createNote}>Create Note</button>

      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteNote(note)}>Delete note</button>
              {
                <img src={note.image_URL} style={{width: 400}} />
              }
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);