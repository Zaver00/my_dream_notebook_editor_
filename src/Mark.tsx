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
      .replace(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/gim, "<a href='$2'>$1</a>")
      .replace(/^\- (.*$)/gim, "<li>$1</li>")
      .replace(/^\___/gim, "<hr/>")
      .replace(/^.\. (.*$)/gim, "<ol><li>$1</li></ol>")
      
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setPreview(convertMarkdownToHtml(e.target.value));
  };

  const toggleMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleKeyDown = (event: { metaKey: any; ctrlKey: any; key: string; preventDefault: () => void; }) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
      event.preventDefault();
      toggleMode();
    }
  };

  // Добавляем обработчик событий на нажатие клавиш
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditMode]);

  // Here you could also implement file saving/loading using `invoke` with Tauri commands.
  
  function getname(file: string): string{
      return file.replace(/([^\/]+)\.md$/, "$1").split('/').pop() || '';
  }

  return (
    <div className="Grand">
      <div className="sidebox">
         <button onClick={toggleMode}>
        {isEditMode ? "Switch to Preview" : "Switch to Edit"}
        </button>
        <button onClick={saveFile}>Save</button>
        <button onClick={openFolder}>Open Folder</button>
        {files.map((file, idx) => (
          <div key={idx} onClick={() => openFile(file)}>
            {getname(file)}
          </div>
        ))}
        
      </div>
      {isEditMode ? (
        <textarea
          value={content}
          onChange={handleInputChange}
          // style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: preview }}
          style={{ width: "100%", height: "100%", padding: "10px" }}
        />

      )}
    </div>
  );
}

export default MarkdownEditor;