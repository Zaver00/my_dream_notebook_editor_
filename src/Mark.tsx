import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';

function MarkdownEditor() {
  //Editor
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<React.ReactNode>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  //Folder
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [folderPath, setFolderPath] = useState<string>('');
  const [filename, setFileName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
      setIsModalOpen(!isModalOpen);
  };
  const openFolder = async () => {
    const folder = await open({ directory: true });
    if (folder) {
      setFolderPath(folder as string);
      invoke('list_files_in_directory', { directory: folder })
        .then((fileList) => setFiles(fileList as string[]))
        .catch((err) => console.error('Error listing files:', err));
    }
  };

  const openFile = (filePath: string) => {
    setSelectedFile(filePath);
    invoke('read_file', { path: filePath })
      .then((content) => {
        setContent(content as string);
        setPreview(convertMarkdownToHtml(content as string));
      })
      .catch((err) => console.error('Error reading file:', err));
  };

  const saveFile = () => {
    if (selectedFile) {
      invoke('save_file', { path: selectedFile, content: content })
        .catch((err) => console.error('Error saving file:', err));
    }
  };

  // Function to convert markdown to HTML (simple example)
  const resds = (markdown: string) => {
    // Here you could use a more complex markdown to HTML converter
    return markdown
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
      .replace(/!\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/gim, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
      .replace(/\n$/gim, "<br />")
      // .replace(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/gim, "<button onClick={openFile('$2')} >$1</button>")
      .replace(/^\- (.*$)/gim, "<li>$1</li>")
      .replace(/^\___/gim, "<hr/>")
      .replace(/^.\. (.*$)/gim, "<ol><li>$1</li></ol>")
      
  };

  const convertMarkdownToHtml = (text: string): React.ReactNode => {
    const parts = text.split("\n").filter(Boolean); // Разделяем по новой строке и убираем пустые элементы
  
    const listItems: React.ReactNode[] = [];
    let currentListType: 'ol' | 'ul' | null = null;
  
    return (
      <div>
        {parts.map((part, index) => {
          // Проверяем, является ли строка заголовком
          const h3 = part.match(/^### (.*)$/);
          const h2 = part.match(/^## (.*)$/);
          const h1 = part.match(/^# (.*)$/);
          const bold = part.match(/\*\*(.*)\*\*/gim);
          const quote = part.match(/^\> (.*$)/gim);
          const cursiv = part.match(/\*(.*)\*/gim);
          const list = part.match(/^\- (.*$)/gim);
          const line = part.match(/^\___/gim);
          const ollist = part.match(/^.\. (.*$)/gim);
          const create_link = part.match(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/gim);
  
          let renderedPart: React.ReactNode = null;
  
          if (h3) {
            renderedPart = <h3 key={index}>{h3[1].trim()}</h3>;
          } else if (h2) {
            renderedPart = <h2 key={index}>{h2[1].trim()}</h2>;
          } else if (h1) {
            renderedPart = <h1 key={index}>{h1[1].trim()}</h1>;
          } else if (bold) {
            renderedPart = <strong key={index}>{bold[1].trim()}</strong>;
          } else if (quote) {
            renderedPart = <blockquote key={index}>{quote[0].trim()}</blockquote>;
          } else if (cursiv) {
            renderedPart = <em key={index}>{cursiv[1].trim()}</em>;
          } else if (list) {
            currentListType = 'ul'; // Ненумерованный
            listItems.push(<li key={index}>{list[0].substring(2).trim()}</li>);
            return null; // Не рендерим ничего, т.к. уже добавили в listItems
          } else if (ollist) {
            currentListType = 'ol'; // Нумерованный
            listItems.push(<li key={index}>{ollist[0].substring(2).trim()}</li>);
            return null; // Не рендерим ничего, т.к. уже добавили в listItems
          } else if (line) {
            // Отображаем линию
            if (listItems.length) {
              const List = currentListType === 'ol' ? 'ol' : 'ul';
              renderedPart = (
                <>
                  <List key={`list-${index}`}>{listItems}</List>
                  {listItems.length = 0} {/* Сбрасываем items */}
                  <hr />
                </>
              );
            } else {
              renderedPart = <hr key={index} />;
            }
          } else if (create_link) {
            const partsWithLinks = part.split(create_link[0]); // Разделяем текст по ссылке
            const fileName = create_link[0].replace(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/gim, "$1"); // Имя ссылки
            const path = create_link[0].replace(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/gim, "$2"); // Путь ссылки
  
            // Добавляем часть до ссылки, саму ссылку и часть после
            renderedPart = (
              <span key={index}>
                {partsWithLinks.map((part, partIndex) => (
                  <>
                    {part}
                    {partIndex < partsWithLinks.length - 1 && (
                      <button onClick={() => openFile(path)}>{fileName}</button>
                    )}
                  </>
                ))}
              </span>
            );
          } 
          
          // Если нет специального формата, отображаем текст как параграф
          if (!renderedPart) {
            renderedPart = <p key={index}>{part.trim()}</p>;
          }
  
          return renderedPart; // Возвращаем отрендеренный элемент
        })}
        
        {/* Рендерим список, если есть элементы */}
        {listItems.length > 0 && (currentListType === 'ol' ? <ol>{listItems}</ol> : <ul>{listItems}</ul>)}
      </div>
    );
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setPreview(convertMarkdownToHtml(e.target.value as string));
  };

  const toggleMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleKeyDown = (event: { metaKey: any; ctrlKey: any; key: string; preventDefault: () => void; }) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'e' ||  (event.metaKey || event.ctrlKey) && event.key === 'у' ) {
      event.preventDefault();
      toggleMode();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'i' ||  (event.metaKey || event.ctrlKey) && event.key === 'ш' ) {
      event.preventDefault();
      toggleModal();
    }
  };

  // Добавляем обработчик событий н а нажатие клавиш
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditMode, isModalOpen]);

  //For Windows '\\' for unix '/'
  function getname(file: string): string{
      return file.replace(/([^\/]+)\.md$/, "$1").split('/').pop() || '';
  }

  return (
    <div className="Grand">
      {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={toggleModal}>&times;</span>
                        <button onClick={saveFile}>Save</button>
                        <button onClick={openFolder}>Open Folder</button>
                        {files.map((file, idx) => (
                          <div key={idx} onClick={() => [openFile(file), toggleModal()]}>
                            {getname(file)}
                          </div>
                        ))}
                    </div>
                </div>
      )}
      {isEditMode ? (
        <textarea
          value={content}
          onChange={handleInputChange}
        />
      ) : (
        
          // dangerouslySetInnerHTML={{ __html: preview }}
          // style={{ width: "100%", height: "100%", padding: "10px" }}
          
          preview
        

      )}
      
    </div>
  );
}

export default MarkdownEditor;