import {useParams} from "react-router-dom";

export default function UserKeys() {
    const params = useParams();

    return (<div>User Keys Page for App ID: {params.urlName} + keyPageId + {params.pageId}</div>);
}