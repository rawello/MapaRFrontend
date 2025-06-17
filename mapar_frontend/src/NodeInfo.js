import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { QRCodeCanvas } from 'qrcode.react';
import './NodeInfo.css';

function QRModal({ open, onClose, qrData, downloadQRCode, qrRef, children }) {
    useEffect(() => {
        if (!open) return;
        const onEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [open, onClose]);
    if (!open) return null;
    return ReactDOM.createPortal(
        <div
            className="qr-modal"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onClick={e => {
                if (e.target.classList.contains('qr-modal')) onClose();
            }}
        >
            <div className="qr-modal-content" ref={qrRef}>
                <button className="close-button" onClick={onClose} aria-label="Закрыть окно">×</button>
                {children}
                <QRCodeCanvas
                    value={qrData}
                    size={256}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                        src: "/building2.png",
                        height: 24,
                        width: 24,
                        excavate: true,
                    }}
                />
                <button className="download-button" onClick={downloadQRCode}>
                    Сохранить QR-код
                </button>
            </div>
        </div>,
        document.body
    );
}

QRModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    qrData: PropTypes.string.isRequired,
    downloadQRCode: PropTypes.func.isRequired,
    qrRef: PropTypes.object.isRequired,
    children: PropTypes.node
};

const NodeInfo = ({ selectedNode, building, showQR, onShowQR, onCloseQR, nodes }) => {
    const qrRef = useRef();
    const viewNodes = nodes?.filter(n => (
        (typeof n.type === 'string' && n.type.toLowerCase() === 'view') ||
        (typeof n.modelPath === 'string' && n.modelPath.toLowerCase() === 'view')
    )) || [];
    const [qrNodeId, setQrNodeId] = useState(selectedNode?.id?.toString() || viewNodes?.[0]?.id?.toString());
    const qrNode = viewNodes?.find(n => n.id?.toString() === qrNodeId) || selectedNode;

    useEffect(() => {
        setQrNodeId(selectedNode?.id?.toString() || viewNodes?.[0]?.id?.toString());
    }, [selectedNode, nodes]);

    const generateQRData = () => {
        return JSON.stringify({
            type: "mapar_location",
            buildingId: building?.id || 4,
            buildingName: building?.name || "Building 1",
            buildingAddress: building?.address || "Address 1",
            nodeId: qrNode?.id || 10,
            nodeName: qrNode?.name || "19",
            nodeTitle: qrNode?.title || "133"
        });
    };

    const downloadQRCode = () => {
        const canvas = qrRef.current.querySelector('canvas');
        if (!canvas) return;
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = `qr-code-node-${qrNode?.id || 'unknown'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="nodeInfo">
            <h3>Информация: </h3>
            <div>
                <label htmlFor="nodeCoordinates">Координаты:</label>
                <span id="nodeCoordinates">{selectedNode?.translation || ''}</span>
            </div>
            <div>
                <label htmlFor="nodeQuaternion">Кватернион:</label>
                <span id="nodeQuaternion">{selectedNode?.quaternion || '0,0,0,1'}</span>
            </div>
            <button className="qr-button" onClick={onShowQR}>
                Показать QR-код
            </button>
            <QRModal
                open={showQR}
                onClose={onCloseQR}
                qrData={generateQRData()}
                downloadQRCode={downloadQRCode}
                qrRef={qrRef}
            >
                <div style={{ width: '100%', marginBottom: 16 }}>
                    <label htmlFor="qr-node-select" className="qr-node-label">Точка для QR:</label>
                    {viewNodes.length > 0 ? (
                        <select
                            id="qr-node-select"
                            className="qr-node-select"
                            value={qrNodeId}
                            onChange={e => setQrNodeId(e.target.value)}
                            style={{ width: '100%', marginTop: 8, marginBottom: 8 }}
                        >
                            {viewNodes.map(node => (
                                <option key={node.id} value={node.id?.toString()}>
                                    {node.name || node.id} {node.title ? `(${node.title})` : ''}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div style={{ color: '#c00', marginTop: 8 }}>Нет точек типа "view" для генерации QR</div>
                    )}
                </div>
            </QRModal>
        </div>
    );
};

NodeInfo.propTypes = {
    selectedNode: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        title: PropTypes.string,
        translation: PropTypes.string,
        quaternion: PropTypes.string
    }),
    building: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        address: PropTypes.string
    }),
    showQR: PropTypes.bool.isRequired,
    onShowQR: PropTypes.func.isRequired,
    onCloseQR: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string
    }))
};

export default NodeInfo;