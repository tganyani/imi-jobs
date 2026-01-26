const PdfViewer = ({ url }: { url: string }) => (
  <iframe
    src={url}
    width="100%"
    height="800px"
    style={{ border: "none" }}
    title="PDF Viewer"
  />
);

export default PdfViewer;
