export default (ssrData = [], ssrId = '') => {
  const dataForSSRId = ssrData.find((data) => data.ssrId === ssrId);
  return dataForSSRId?.data || null;
};