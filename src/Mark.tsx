import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';

function MarkdownEditor() {
  //Editor
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState("");
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

  const handleLinkClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = event.target as HTMLAnchorElement;
  
    // Проверяем, что клик произошел по элементу <a> и ссылка ведет на файл в текущей папке
    if (target.tagName === 'A' && target.href.includes(folderPath)) {
      event.preventDefault(); // Отменяем стандартное поведение ссылки
  
      const fileName = target.href.split('/').pop()?.replace('.md', ''); // Получаем имя файла без расширения
      const filePath = `${folderPath}/${fileName}.md`; // Полный путь к файлу
  
      // Открываем файл
      openFile(filePath);
    }
  };

  // Function to convert markdown to HTML (simple example)
  const convertMarkdownToHtml = (markdown: string) => {
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

const Test = () => {
  const text = "### Заголовок 1\nНекоторый текст\n# Заголовок 2\n**Текст под заголовком** asad as\n## Заголовок 3\nСледующий текст\n[[test|te/Collection.md]]";

const parts = text.split("\n").filter(Boolean); // Разделяем по новой строке и убираем пустые элементы

return (
  <div>
    {parts.map((part, index) => {
      // Проверяем, является ли строка заголовком
      const h3 = part.match(/^### (.*)$/);
      const h2 = part.match(/^## (.*)$/);
      const h1 = part.match(/^# (.*)$/);

      const create_link =  part.match(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/gim);

      if (h3) {
        return <h3 key={index}>{h3[1].trim()}</h3>; // Возвращаем заголовок без "### "
      }
      if (h2) {
        return <h2 key={index}>{h2[1].trim()}</h2>; // Возвращаем заголовок без "### "
      } 

      if (part.startsWith("# ")) {
        return <h1 key={index}>{part.replace("# ", "").trim()}</h1>; // Возвращаем заголовок без "### "
      } 
      if (part.startsWith("**") && part.endsWith("**")) {
        return <em key={index}>{part.replace(/\*\*(.*)\*\*/gim, "").trim()}</em>; // Возвращаем заголовок без "### "
      } 

      if (create_link) {

        return <button key={index} onClick={() => openFile(create_link[2] as string)}> { "ss" } </button>
      }
      return <p key={index}>{part.trim()}</p>; // Остальной текст в абзаце
    })}
  </div>
);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setPreview(convertMarkdownToHtml(e.target.value));
  };

  const toggleMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleKeyDown = (event: { metaKey: any; ctrlKey: any; key: string; preventDefault: () => void; }) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'e' ||  event.key === 'у' ) {
      event.preventDefault();
      toggleMode();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'i' ||  event.key === 'ш' ) {
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
      return file.replace(/([^\/]+)\.md$/, "$1").split('\\').pop() || '';
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
        <div
          dangerouslySetInnerHTML={{ __html: preview }}
          style={{ width: "100%", height: "100%", padding: "10px" }}
          
        />

      )}
      {Test()}
    </div>
  );
}

export default MarkdownEditor;