import preact from 'preact';
import DynamicInput from "./DynamicInput";

export default class DynamicInputContainer extends preact.Component {
    constructor(props) {
        super(props);
        this.state = DynamicInputContainer.getDerivedStateFromProps(this.props, {});

        this.addDynamicInput = this.addDynamicInput.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.removeDynamicInput = this.removeDynamicInput.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    // This is not yet implemented in preact but componentWillReceiveProps is going to be deprecated in React, so we will use this workaround to simulate the future. How exciting O.o
    // Relevant issue: https://github.com/developit/preact/issues/1047
    static getDerivedStateFromProps(nextProps, prevState) {
        let fields_object = {};
        nextProps.fields.forEach((field, i) => {
            if(!field['value']) field['value'] = field['type'] === 'address' ? {} : '';
            fields_object[i + 1] = field;
        });
        return {
            fields: fields_object,
            fields_counter: nextProps.fields.length || 0,
            'dynamic-input-type': prevState['dynamic-input-type'] || 'input',
            primary_address: 0
        };
    }

    shouldComponentUpdate(nextProps) {
        return nextProps !== this.props;
    }

    componentWillReceiveProps(nextProps) {
        if(this.shouldComponentUpdate(nextProps)) {
            this.setState(DynamicInputContainer.getDerivedStateFromProps(nextProps, this.state));
        }
    }

    render() {
        let input_elements = [];
        for(let i in this.state.fields) {
            let field = this.state.fields[i];
            input_elements.push(<DynamicInput key={i} id={i} type={field.type} desc={field.desc} optional={field.optional}
                                              removeHandler={this.removeDynamicInput} onChange={this.handleInputChange}
                                              primary={this.state.primary_address === i} onPrimaryChange={this.handleInputChange}/>);
        }
        return (
            <fieldset>
                <legend>Meine Daten</legend>
                Die Daten, die Du hier eingibst, helfen dem Unternehmen Dich zu identifizieren. Gib ruhig erst einmal zu wenig als zu viel an – im Zweifelsfall wird das Unternehmen schon nachfragen.<br />
                Wenn wir Erfahrungswerte zu Daten haben, die definitiv angegeben werden müssen, sind diese mit einem * gekennzeichnet.
                <div id="request-dynamic-input">
                    {input_elements}
                </div>
                <div className="dynamic-input-controls">
                    Du möchtest weitere Daten ergänzen? Kein Problem: Wähle einfach den passenden Feldtyp.<br />
                    <select id="dynamic-input-type" onChange={this.handleTypeChange}>
                        <option value="input" selected>Freitext (einzeilig)</option>
                        <option value="textarea">Freitext (mehrzeilig)</option>
                        <option value="address">Adresse</option>
                    </select>
                    <button id="add-dynamic-inputs" onClick={this.addDynamicInput}>Feld hinzufügen</button>
                </div>
            </fieldset>
        );
    }

    handleInputChange(event) {
        let id = event.target.getAttribute('id').split('-');
        this.setState(prev => {
            switch(id[1]) {
                case 'value':
                    prev.fields[id[0]].value = event.target.value;
                    break;
                case 'desc':
                    prev.fields[id[0]].desc = event.target.value;
                    break;
                case 'primaryButton':
                    prev['primary_address'] = id[0];
                    break;
                default:
                    prev.fields[id[0]].value[id[1]] = event.target.value;
            }
            return prev;
        });
        this.props.onChange({data: this.getDataArray()});
    }

    handleTypeChange(event) {
        this.setState(prev => {
            prev['dynamic-input-type'] = event.target.value;
            return prev;
        });
    }

    addDynamicInput() {
        let field = {
            desc: '',
            type: this.state['dynamic-input-type'],
            optional: true,
            value: this.state['dynamic-input-type'] === 'address' ? {} : ''
        };
        this.setState(prev => {
            prev.fields_counter = prev.fields_counter + 1;
            prev.fields[prev.fields_counter] = field;
            return prev;
        });
        console.log(this.state);
    }

    removeDynamicInput(event) {
        this.setState(prev => {
            delete prev.fields[event.target.getAttribute('rel')];
            return prev;
        })
    }

    getDataArray() {
        let data = [];
        for(let i in this.state.fields) {
            let field = this.state.fields[i];
            if(field['type'] === 'address') field.value['primary'] = (this.state.primary_address === i);
            data.push(field);
        }
        return data;
    }
}
