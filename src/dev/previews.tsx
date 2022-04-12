import React from 'react';
import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox';
import {PaletteTree} from './palette';
import DispensationFormPage from "../pages/pharmacy/dispensations/DispensationFormPage";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/DispensationFormPage">
                <DispensationFormPage/>
            </ComponentPreview>
        </Previews>
    );
};

export default ComponentPreviews;