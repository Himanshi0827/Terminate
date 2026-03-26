import { useEffect, useState } from "react";
import { getAgreementById, updateAgreement } from "../api/api";
import {  useParams, useNavigate , useLocation } from "react-router-dom";
import { fetchAgreement} from "../api/api";
import { toast } from "react-toastify";
import "../AgreementExtension.css";
export default function AgreementExtension() {
// const location = useLocation();//head
  const navigate = useNavigate();
const { agreementId } = useParams();   // 👈 from URL
const location = useLocation();
 
const id =
  agreementId ||                      // ✅ FIRST priority (URL)
  location.state?.agreementId ||     // fallback (navigation)
  null;
 
if (!id) {
  console.error("Agreement ID not found in URL or state");
}
// const id =
//   location.state?.agreementId ||
//   "c6fb1c12-5f42-4012-8c44-adf46ce98b8c";
 
const agreementName =
  location.state?.agreementName ||
  "Philips Trial";
 
 
 
  const [agreement, setAgreement] = useState(null);
  const [endDate, setEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [reason, setReason] = useState("");
  const [isValidityScreen, setIsValidityScreen] = useState(false);
 
const statusesToConsiderValidity = ["In Authoring","In Signatures"];
 
  useEffect(() => {
    loadAgreement();
  }, []);
 
  const loadAgreement = async () => {
//const data2= await fetchAgreement();
    const data = await getAgreementById(id);
console.log("data",data);
//   console.log("data2",data2);
    setAgreement(data[0]);
    setEndDate(data[0].ContractEndDate);
 
    const validity =
      statusesToConsiderValidity.includes(data[0].StatusCategory) ;
    //   data.APTS_Agreement_Inserted_Successfully__c === false;
 
    setIsValidityScreen(validity);
console.log("valid",validity);
console.log("valid3",data[0].StatusCategory);
    if (validity) {
      setStartDate(data[0].ContractStartDate);
    }
  };
// const loadAgreement = async () => {
//   const data = await getAgreementById(id);
//   console.log("data", data);
 
//   // Check if data exists and has items before trying to access index 0
//   if (data && data.length > 0) {
//     setAgreement(data[0]);
//     setEndDate(data[0].ContractEndDate);
 
//     const validity = statusesToConsiderValidity.includes(data[0].StatusCategory);
//     setIsValidityScreen(validity);
 
//     if (validity) {
//       setStartDate(data[0].ContractStartDate);
//     }
//   } else {
//     // Handle the error gracefully
//     console.error("No data returned or API call failed");
//     // Optionally: alert("Could not load agreement details.");
//   }
// };
  const handleSave = async () => {
 
    const today = new Date().toISOString().split("T")[0];
 
    if (!reason) {
      alert("Extension Reason cannot be blank");
      return;
    }
 
    if (endDate <= today) {
      alert("The new Expiry Date cannot be earlier than today");
      return;
    }
 
    const oldEndDate = agreement.ContractEndDate;
 
    
let payload = {
  ContractStartDate: agreement.ContractStartDate,
  APTS_Extension_Reason_c: reason
};
 
// VALIDITY
if (isValidityScreen) {
 
  payload = {
    ...payload,
    ContractEndDate: endDate
  };
 
}
 
// EXTENSION
else if (endDate > oldEndDate) {
 
  payload = {
    ...payload,
    ContractEndDate: endDate,
    APTS_Extend_post_Save_action__c: "E",
    Apttus__Status__c: "Being Extended",
    APTS_Extension_SAP_Status__c: "In Progress",
    APTS_Last_Extended_on_Date__c: new Date().toISOString().split("T")[0]
  };
 
}
 
// PREPONEMENT
else if (endDate < oldEndDate) {
 
  payload = {
    ...payload,
    ContractEndDate: endDate,
    APTS_Extend_post_Save_action__c: "P",
    Apttus__Status__c: "Being Preponed",
    Apttus_Approval__Approval_Status__c: "Approval Required",
    APTS_Proposed_Preponement_Date__c: endDate,
    APTS_Last_Extended_on_Date__c: new Date().toISOString().split("T")[0]
  };
 
}
    try {
console.log("final",payload);
      await updateAgreement(id, payload);
 
      toast.success("Agreement updated successfully");
 
    navigate(`https://preview-rls09.congacloud.com/clm/detail/${id}`);
 
    } catch (err) {
 
      console.error(err);
      alert("Error updating agreement");
 
    }
  };
 
  if (!agreement) return <div>Loading...</div>;
return (
<div className="agreement-page">
 
    <div className="header">
<h1>Agreement Extension</h1>
<div className="header-buttons">
<button className="btn primary" onClick={handleSave}>Save</button>
        {/* <button className="btn" onClick={() => navigate("/")}>Cancel</button> */}
<button 
  className="btn" 
  onClick={() => window.location.href = `https://preview-rls09.congacloud.com/clm/detail/${id}`}
>
  Cancel
</button>
</div>
</div>
 
    <div className="section">
 
      <div className="section-header">
<span className="arrow">▾</span>
<span>Extension Details</span>
</div>
 
      <div className="form-container">
 
        {isValidityScreen && (
<div className="form-row">
<label>Effective Date</label>
<input
              type="date"
              value={startDate || ""}
              disabled
            />
</div>
        )}
 
        <div className="form-row">
<label>Expiration Date</label>
<input
            type="date"
            value={endDate || ""}
            onChange={(e) => setEndDate(e.target.value)}
          />
</div>
 
        <div className="form-row">
<label>Extension Reason</label>
<textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
</div>
 
        <div className="bottom-buttons">
<button className="btn primary" onClick={handleSave}>Save</button>
<button 
  className="btn" 
  onClick={() => window.location.href = `https://preview-rls09.congacloud.com/clm/detail/${id}`}
>
  Cancel
</button>
          {/* <button className="btn" onClick={() => navigate("/")}>Cancel</button> */}
</div>
 
      </div>
</div>
</div>
);
 
}
