import React, { useState, useEffect } from 'react';
import './App.css';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

// //const Jimp = require('jimp');
// import Jimp from 'jimp';
// const fs = require('fs')
// const path = require('path')
// const {spawn} = require('child_process')

// const bckgrndDir = __dirname + "\\image-background-remove-tool-master\\docs\\imgs\\";
// const inputDir = bckgrndDir + "input\\";
// const outputDir = bckgrndDir + "output\\";

// console.log("test")
// console.log(__filename)
// test();
// async function test(){

//   const rotImage = await Jimp.read('white.png');
// }

// let outputWidth = 750;
// let outputHeight = 1334;
// let ppi = 326;

// function outputImage(img, whitesq, sqSize, outputWidth, outputHeight, ppi){
//   console.log("3");
//     return new Jimp(outputWidth, outputHeight, 0x000000FF, (err, comp) => {
//       if (err)
//         return err

//       let x_center = outputWidth / 2;
//       let y_center = outputHeight / 2;


//       //resizing + blitting white sq
//       whitesq.scale(ppi * sqSize / 16);
//       let x_cursor = x_center - whitesq.bitmap.width / 2
//       let y_cursor = y_center - whitesq.bitmap.height / 2
//       comp.blit(whitesq, x_cursor, y_cursor)

//       //make sure image fits 
//       img.resize(Math.min(img.bitmap.width, whitesq.bitmap.width),Jimp.AUTO)
//       img.resize(Jimp.AUTO, Math.min(img.bitmap.height, y_cursor, x_cursor))

//       //copying rotated desired image to composition
//       //top
//       let imageRot = img.clone();
//       x_cursor = x_center - imageRot.bitmap.width / 2
//       y_cursor = y_center - imageRot.bitmap.height - whitesq.bitmap.height / 2 
//       console.log(x_cursor +","+y_cursor)
//       comp.blit(imageRot, x_cursor, y_cursor)
//       //left
//       imageRot = img.clone();
//       imageRot.rotate(90);
//       x_cursor = x_center - imageRot.bitmap.width - (whitesq.bitmap.width / 2) + 2
//       y_cursor = y_center - (imageRot.bitmap.height / 2)
//       console.log(x_cursor +","+y_cursor)
//       comp.blit(imageRot, x_cursor, y_cursor)
//       //bottom
//       imageRot = img.clone();
//       imageRot.rotate(180);
//       x_cursor = x_center - imageRot.bitmap.width / 2
//       y_cursor = y_center + whitesq.bitmap.height / 2  - 1
//       comp.blit(imageRot, x_cursor, y_cursor)
//       console.log(x_cursor + "," + y_cursor)
//       //right
//       imageRot = img.clone();
//       imageRot.rotate(270);
//       x_cursor = x_center + whitesq.bitmap.width / 2  -1
//       y_cursor = y_center - imageRot.bitmap.height / 2
//       console.log(x_cursor + "," + y_cursor)
//       comp.blit(imageRot, x_cursor, y_cursor)
      
//       //writing
//       return comp.write('_holo' + sqSize + '.png');
      
//     });
// };

// function removeBackground(img){
//   //copying stuff
//   fs.copyFileSync(img, inputDir + img);

//   const python = spawn('cmd.exe', ['/c', 'remove.bat']);
//   python.stdout.on('data', (data) => {
//       console.log(`stdout: ${data}`);
//   });

//   python.stderr.on('data', (data) => {
//       console.log(`stderr: ${data}`);
//   });

//   python.on('exit', (code) => {
//       console.log(`Child exited with code ${code}`);

//       //delete input and copy back to original dir
//       fs.unlink(inputDir + img, () => {console.log("input deleted")});
//       let imgSep = img.split('.');
//       fs.copyFileSync(outputDir + imgSep[0] + ".png", path.join(__dirname, "noBckgrnd.png"));

//       //change to black background
//       Jimp.read("noBckgrnd.png").then(img => {
//         img.opaque()
//         Jimp.read('white.png').then(whitesq => {
//           outputImage(img.clone(), whitesq.clone(), .5, 750, 1334, 326);
//           outputImage(img.clone(), whitesq.clone(), 1, 1536, 2048, 264);
//         });
//       });
//   });
// }

const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
  const apiData = await API.graphql({ query: listNotes });
  const notesFromAPI = apiData.data.listNotes.items;

  await Promise.all(notesFromAPI.map(async note => {
    if (note.image) {
      const image = await Storage.get(note.image);

      note.image = image;
    }
    return note;
  }))
  setNotes(apiData.data.listNotes.items);
}

  async function createNote() {
  if (!formData.name ) return;
  await API.graphql({ 
    query: createNoteMutation,
    variables: { input: formData }
  });
  if (formData.image) {
    let image = await Storage.get(formData.image);

    formData.image = image;
  }
  setNotes([ ...notes, formData ]);
  setFormData(initialFormState);
}

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ 
      query: deleteNoteMutation,
      variables: { input: { id }}
    });
  }

  async function onChange(e) {
  if (!e.target.files[0]) return
  const file = e.target.files[0];
  
  // console.log(e)
  // console.log("1");
  // const rotImage = await Jimp.read('white.png');
  // .then(async whitesq => {
  //   console.log("2");
  //   //return outputImage(file, whitesq, .5, outputWidth, outputHeight, ppi);

  //   return whitesq.getBufferAsync(Jimp.AUTO);
  // })
  // .catch(err => {
  //   console.error(err);
  // });



  setFormData({ ...formData, image: file.name });
  await Storage.put(file.name, file);
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
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="img description"
        value={formData.description}
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
                note.image && <img src={note.image} style={{width: 400}} />
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