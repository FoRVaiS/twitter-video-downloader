import axios from 'axios';

export const downloadFile = async (url: string) => {
  const { data } = await axios(url);

  return data;
};
