export const formatDescriptionAsParagraphs = (text: string, sentencesPerParagraph = 2) => {
  const sentences = text
    .replace(/\n/g, ' ')
    .match(/[^.!?]+[.!?]+/g); 

  if (!sentences) return text; 

  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
    const chunk = sentences.slice(i, i + sentencesPerParagraph).join(' ').trim();
    paragraphs.push(chunk);
  }

  return paragraphs.join('\n\n'); 
};


export const truncateCharacters = (text:string, charLimit:number) => {
  if (!text) return '';
  return text.length <= charLimit ? text : text.substring(0, charLimit) + '...';
};