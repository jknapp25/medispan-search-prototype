export default function DrugBank() {
  return (
    <div className="m-10">
      <script src="/drugbank-ui.min.js" defer></script>
      <h1 className="text-lg mb-4 font-bold">DrugBank Web Component</h1>
      <meta name="DRUGBANK_UI_LOG_LEVEL" content="debug" />
      <db-medication-search refresh-jwt="/api/refresh"></db-medication-search>
    </div>
  );
}
