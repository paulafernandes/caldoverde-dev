import LegalDocumentPage from "../../../components/LegalDocumentPage";
import legalNotice from "../../../data/legal/legalNotice";
import { getLegalPageProps } from "../../../server/legalPageProps";

export default function LegalNoticePage(props) {
  return (
    <LegalDocumentPage
      {...props}
      path="legal-notice"
      textKey="legalNoticePage"
    />
  );
}

export async function getServerSideProps(context) {
  return getLegalPageProps(context, {
    document: legalNotice,
    path: "legal-notice",
    textKey: "legalNoticePage",
  });
}
