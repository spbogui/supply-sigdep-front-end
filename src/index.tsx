import React from "react";
import ReactDOM from "react-dom";
import {QueryClient, QueryClientProvider} from "react-query";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {ReactQueryDevtools} from "react-query/devtools";
import {MantineProvider} from "@mantine/core";
import {ModalsProvider} from "@mantine/modals";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

const queryClient = new QueryClient();

ReactDOM.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <MantineProvider>
                <ModalsProvider>
                    <DevSupport
                        ComponentPreviews={ComponentPreviews}
                        useInitialHook={useInitial}
                    >
                        <App/>
                    </DevSupport>
                </ModalsProvider>
            </MantineProvider>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
