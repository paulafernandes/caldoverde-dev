import LegalDocumentPage from "../../../components/LegalDocumentPage";
import privacyPolicy from "../../../data/legal/privacy";
import { getLegalPageProps } from "../../../server/legalPageProps";

export default function PrivacyPage(props) {
  return <LegalDocumentPage {...props} path="privacy" textKey="privacyPage" />;
}

export async function getServerSideProps(context) {
  return getLegalPageProps(context, {
    document: privacyPolicy,
    path: "privacy",
    textKey: "privacyPage",
  });
}
