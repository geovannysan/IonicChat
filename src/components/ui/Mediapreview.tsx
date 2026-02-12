import { FileText } from "lucide-react";
import { MediaViewerDialog } from "../MediaViewerDialog";
import { parseAdvancedVCard, parseGoogleMapsLocation } from "@/lib/utils";
interface MediaPreviewProps {
    type: string; // "image" | "video" | "audio"
    url: string;
    body: string;
}
export const MediaPreview: React.FC<MediaPreviewProps> = ({ type, url, body }) => {
    if (type === "image") {
        return (
            <MediaViewerDialog type="image" url={url}>
                <div className="max-w-[220px] max-h-[250px] overflow-hidden rounded-lg shadow-sm bg-muted">
                    <img
                        src={url}
                        alt="Imagen"
                        className="w-full h-auto object-cover"
                    />
                </div>
            </MediaViewerDialog>
        );
    }
    if (type === "application") {
        return (
            <div>
                <FileText className="h-20 w-20 text-muted-foreground" />
                <p className="text-lg font-medium">
                    {(() => {
                        const urls = url || "";
                        const path = urls.split("?")[0].split("#")[0];
                        const filename = path.substring(path.lastIndexOf("/") + 1);
                        return filename || path;
                    })()}
                </p>
            </div>

        );
    }

    if (type === "video") {
        return (
            <MediaViewerDialog type="video" url={url}>
                <div className="max-w-[220px] max-h-[250px] overflow-hidden rounded-lg shadow-sm bg-muted">
                    <video controls={false} autoPlay={false}  playsInline={false}  className="w-full h-auto">
                        <source  src={url}  />
                    </video>
                </div>
            </MediaViewerDialog>
        );
    }
    if (type === "location") {

        const location = parseGoogleMapsLocation(body);
        return (

            <div>

                <a
                    href={`https://maps.google.com/maps?q=${location?.latitude},${location?.longitude}&z=17`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block max-w-[250px] rounded-lg overflow-hidden shadow-sm border bg-muted"
                >
                    <img src={"data:image/png;base64,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"} alt="Ubicación" className="w-full h-auto" />
                    {location?.label && (
                        <div className="p-2 text-sm text-muted-foreground border-t">
                            {location.label}
                        </div>
                    )}
                </a>
                {location?.label}
            </div>
        );
    }
    if (type === "audio") {
        return (

            <div className=" w-[300px]   bg-gray-100   border rounded-4xl border-gray-400 items-center" >
                <video controls className="w-full h-[70px] pb-1.5 ">
                    <source src={url} />
                </video>
            </div>

        );
    }
    if (type === "vcard") {

        const contact = parseAdvancedVCard(body);
        return (
            <div className="max-w-[220px] max-h-[250px] overflow-hidden rounded-lg shadow-sm bg-muted p-2">
                <div className="text-xs text-foreground">
                    {contact?.name && <div><strong>Nombre:</strong> {contact.name}</div>}
                    {contact?.phones[0]?.number && <div><strong>Teléfono:</strong> {contact.phones[0].number}</div>}
                    {contact?.phones[0]?.label && <div><strong>Email:</strong> {contact.phones[0].label}</div>}
                    {!contact && <div>{body}</div>}
                </div>
            </div>
        );
    }
    else {
        return (<div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted rounded-lg">
            <FileText className="h-24 w-24 text-muted-foreground" />
            <p className="text-lg font-medium">{type}</p>
            <p className="text-sm text-muted-foreground">
            </p>
        </div>);
    }

    return null;
};




