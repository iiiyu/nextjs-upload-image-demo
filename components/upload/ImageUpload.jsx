import { useState } from "react";

export function ImageUpload(props) {
  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (event) => {
    const body = new FormData();
    body.append("file", image);
    fetch("/api/upload/file", {
      method: "POST",
      body,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (props.onUpload) {
            props.onUpload(data);
          }
        }
      });
  };
  return (
    <div className="space-y-2">
      <img className="w-1/4" src={createObjectURL} />
      <div className="space-x-4">
        <input type="file" name="myImage" onChange={uploadToClient} />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
          onClick={uploadToServer}
        >
          Upload Image
        </button>
      </div>
    </div>
  );
}
