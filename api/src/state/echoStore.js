// api/src/state/echoStore.ts
const initialState = {
    devices: {},
    models: {},
    sessions: {}
};
export const EchoStore = {
    name: "echo",
    initialState,
    // main reducer
    action: (type, data, state = initialState)=>{
        switch(type){
            case "ECHO/DEVICE_REGISTER":
                {
                    const device = data;
                    return {
                        ...state,
                        devices: {
                            ...state.devices,
                            [device.id]: device
                        }
                    };
                }
            case "ECHO/DEVICE_UPDATE":
                {
                    const deviceUpdate = data;
                    const current = state.devices[deviceUpdate.id];
                    if (!current) return state;
                    return {
                        ...state,
                        devices: {
                            ...state.devices,
                            [deviceUpdate.id]: {
                                ...current,
                                ...deviceUpdate,
                                lastSeen: deviceUpdate.lastSeen ?? Date.now()
                            }
                        }
                    };
                }
            case "ECHO/DEVICE_OFFLINE":
                {
                    const { id } = data;
                    const current = state.devices[id];
                    if (!current) return state;
                    return {
                        ...state,
                        devices: {
                            ...state.devices,
                            [id]: {
                                ...current,
                                status: "offline",
                                lastSeen: Date.now()
                            }
                        }
                    };
                }
            case "ECHO/MODEL_REGISTER":
                {
                    const model = data;
                    return {
                        ...state,
                        models: {
                            ...state.models,
                            [model.id]: model
                        }
                    };
                }
            case "ECHO/MODEL_LOADED":
                {
                    const { id, loaded = true } = data;
                    const current = state.models[id];
                    if (!current) return state;
                    return {
                        ...state,
                        models: {
                            ...state.models,
                            [id]: {
                                ...current,
                                loaded
                            }
                        }
                    };
                }
            case "ECHO/SESSION_STARTED":
                {
                    const session = data;
                    return {
                        ...state,
                        sessions: {
                            ...state.sessions,
                            [session.id]: session
                        }
                    };
                }
            case "ECHO/SESSION_ENDED":
                {
                    const { id, endedAt = Date.now() } = data;
                    const current = state.sessions[id];
                    if (!current) return state;
                    return {
                        ...state,
                        sessions: {
                            ...state.sessions,
                            [id]: {
                                ...current,
                                endedAt
                            }
                        }
                    };
                }
            default:
                return state;
        }
    }
};
