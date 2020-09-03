$(document).ready(function() {
    // $(window).resize(function() {
    //     // $("#log").append("<div>Handler for .resize() called.</div>");
    //     $(".vi").toogleClass("rotate")
    // });
    

    $("#submit-button").on("click", function() {
        // $(".vl").toggleClass('rotate');
        if ($("#write-gec").val() === "") {
            console.log("please enter something in text area")
        } else {
            correct();
        }

    });

    $("#examples").change(function() {
        $("#write-gec").val($("select option:selected").val());
    });



    // $(window).resize(function(){
    //     // $(".vl").hide();
    //     viewport.changed(function() {
    //         if( viewport.is('xs') ) {
                
    //         }
    //     })


});


let threshold = 0.98
let threshold_insert = 0.92
let sent_segmentation = false
let use_truecase = true
// let use_truecase = false
let addPeriod = true
// let addPeriod = false
let generate_insertion_candidates = true
let use_nli = true
// let nli_enable_neutral = false
let nli_enable_neutral = true

// AJAX functions
// Code goes here
const correct = async () => {
    const api = "<your_lesserrors_api_endpoint>/lesserrors";
    const data = JSON.stringify({"sent": $("#write-gec").val(), "threshold": threshold, "threshold_insert": threshold_insert, "sent_segmentation": sent_segmentation, "use_truecase": use_truecase, "addPeriod": addPeriod, "generate_insertion_candidates": generate_insertion_candidates, "use_nli": use_nli, "nli_enable_neutral": nli_enable_neutral});
    try {
        const response = await fetch(api, {
            method: 'POST',
            body: data,
            headers: {'Content-type': 'application/json'}
        });
        if(response.ok){
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            let proc = jsonResponse['proc'];
            let final_step = jsonResponse['result'][0];
            let result = jsonResponse['result'][1];
            let accu_prob_improve = jsonResponse['result'][2];
            let newTbody;
            proc.forEach(step_data => {
                let step = step_data[0];
                let correct_sent = step_data[1][0]
                    .replace(/\[-(.*?)-\]/g, '<span class="deletion">$1</span>')
                    .replace(/\{\+(.+?)\+\}/g, '<span class="correction">$1</span>')
                    .replace(/(\r\n|\n)/g, "<br>");
                let lm_score = step_data[1][1];
                let score_improve = step_data[1][2];
                let correct_error_type = step_data[1][3];
                newTbody +=
                `<tr>
                    <td class="align-center-col">${step}</td>
                    <td>${correct_sent}</td>
                    <td class="align-center-col">${lm_score}</td>
                    <td class="align-center-col">${score_improve}</td>
                    <td class="align-center-col">${correct_error_type}</td>
                </tr>`;
            });
            
            let newTfoot = 
            `<tr>
                <td class="align-center-col">${final_step}</td>
                <td>${result}</td>
                <td class="align-center-col">${proc[proc.length-1][1][1]}</td>
                <td class="align-center-col">${accu_prob_improve}</td>
                <td class="align-center-col"></td>
            </tr>`

            $("#returnTable tbody").children().remove();
            $("#returnTable tfoot").children().remove();

            $("#returnTable tbody").append(newTbody);
            $("#returnTable tfoot").append(newTfoot);
        }
    } catch (error) {
        console.log(error);
    }
}
